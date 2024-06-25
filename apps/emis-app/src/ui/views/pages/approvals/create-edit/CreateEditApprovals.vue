<template>
  <div class="full-height">
    <validation-observer ref="form" v-slot="{ failed }" slim>
      <rc-page-content
        :title="title"
        :loading="loading"
        :show-add-button="false">
        <v-container v-if="!loading">
          <v-row class="justify-center">
            <v-col :class="{ 'table-wrapper': isEditMode }" cols="12" xl="7" lg="9" md="11" sm="12">
              <rc-tabs>
                <rc-tab
                  v-for="lang in supportedLanguages"
                  :key="lang.key"
                  :label="$t(`tab.${lang.key}`)"
                  :data-test="`approvalTemplate__lang--${lang.key}`"
                  :active="languageMode === lang.key"
                  @click="setLanguageMode(lang.key)" />
              </rc-tabs>
              <v-row>
                <v-col v-if="isTableMode" cols="12" md="8" lg="8">
                  <v-autocomplete-with-validation
                    :value="selectedProgram"
                    :items="availablePrograms"
                    :label="`${$t('approvals.associate_program')}*`"
                    :item-text="(item) => $m(item.name)"
                    return-object
                    :loading="isProgramLoading"
                    :disabled="isProgramLoading || disableUpperForm"
                    :rules="rules.program"
                    data-test="approvals__programSelect"
                    @change="setProgram($event)" />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="9" md="8" sm="7">
                  <v-text-field-with-validation
                    v-model="approval.name.translation[languageMode]"
                    data-test="approval-template-name"
                    :disabled="disableUpperForm"
                    :label="`${isTableMode ? $t('approval.table_name') : $t('approval.template_name')} *`"
                    :rules="rules.name"
                    @input="resetAsUnique()" />
                </v-col>

                <v-col cols="3" md="4" sm="5">
                  <div v-if="disabledStatus" :class="`flex-row approval-status py-2 pl-4 ${getStatusClasses} lighten-3 black--text`">
                    <span class="rc-body14">
                      {{ $t('financialAssistance.programIsInactive') }}
                    </span>
                  </div>

                  <div v-else :class="`flex-row approval-status py-2 pl-5 ${getStatusClasses}`">
                    <span :class="`rc-body14 ${isActive ? 'white--text' : 'black--text'} ml-4`" data-test="approval-status">
                      {{ isActive
                        ? `${$t('common.status')} ${$t('enums.Status.Active').toUpperCase()}`
                        : ` ${$t('common.status')} ${$t('enums.Status.Inactive').toUpperCase()}` }}
                    </span>

                    <validation-provider slim>
                      <v-switch
                        v-model="isActive"
                        class="mt-0 ml-auto mr-3 pt-0"
                        flat
                        :aria-label="$t('common.status')"
                        :disabled="disabledStatus || disableUpperForm"
                        data-test="approval-status-toggle"
                        hide-details
                        color="white" />
                    </validation-provider>
                  </div>
                </v-col>
              </v-row>
              <div class="rc-body-14 fw-bold">
                {{ $t('approvals.aggregated_by') }} *
              </div>

              <validation-provider v-slot="{ errors }" :rules="rules.aggregatedBy">
                <v-radio-group v-model="approval.aggregatedByType" :disabled="disableUpperForm" :error-messages="errors" row>
                  <v-radio
                    data-test="total_financialAssistance"
                    :label="$t('enums.ApprovalAggregatedBy.TotalFinancialAssistanceOnCaseFile')"
                    :value="ApprovalAggregatedBy.TotalFinancialAssistanceOnCaseFile" />
                  <v-radio
                    data-test="individual_paymentTotal"
                    :label="$t('enums.ApprovalAggregatedBy.IndividualPaymentTotal')"
                    :value="ApprovalAggregatedBy.IndividualPaymentTotal" />
                </v-radio-group>
              </validation-provider>

              <v-row v-if="isEditMode">
                <v-spacer />
                <div class="mr-3 mb-3">
                  <v-btn :disabled="isSaving || disableUpperForm" data-test="approval-cancelBtn" @click="cancel()">
                    {{ $t('common.buttons.cancel') }}
                  </v-btn>

                  <v-btn
                    class="ml-4"
                    color="primary"
                    :disabled="!changesInEdit"
                    data-test="approval-saveBtn"
                    :loading="isSaving"
                    @click="submit()">
                    {{ $t('common.buttons.save') }}
                  </v-btn>
                </div>
              </v-row>
              <v-row />
            </v-col>
          </v-row>
        </v-container>
        <div class="tableContainer">
          <approval-group-table
            :approval="approval"
            :edit-mode="isEditMode"
            @edit:success="refreshApproval($event)"
            @group:changed="groupHasChanged = $event"
            @add:success="showNoGroupErr = false"
            @deleteGroup="handleGroupDeteted" />
          <div v-if="showNoGroupErr" class="error--text ma-4" data-test="approvalsTable-error-requiredApprovalGroup">
            {{ $t('approvalsTable.error.requiredApprovalGroup') }}
          </div>
        </div>

        <template v-if="!isEditMode" #actions>
          <v-btn :disabled="isSaving" data-test="approval-cancelBtn" @click="cancel()">
            {{ $t('common.buttons.cancel') }}
          </v-btn>

          <v-btn
            color="primary"
            :disabled="showNoGroupErr || failed"
            data-test="approval-saveBtn"
            :loading="isSaving"
            @click="submit()">
            {{ $t('common.buttons.create') }}
          </v-btn>
        </template>
        <template v-else #actions>
          <v-btn color="primary" data-test="back-btn" @click="cancel()">
            {{ $t('approvalTables.details.back') }}
          </v-btn>
        </template>
      </rc-page-content>
    </validation-observer>
  </div>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';
import { NavigationGuardNext, Route } from 'vue-router';
import {
  RcPageContent, RcTab, RcTabs, VAutocompleteWithValidation, VTextFieldWithValidation,
} from '@libs/component-lib/components';
import helpers from '@/ui/helpers/helpers';
import { SUPPORTED_LANGUAGES_INFO } from '@/constants/trans';
import { VForm, Status } from '@libs/shared-lib/types';
import { ApprovalTableEntity } from '@libs/entities-lib/approvals/approvals-table/approvalTable';
import _sortBy from 'lodash/sortBy';
import ApprovalGroupTable from '@/ui/views/pages/approvals/create-edit/ApprovalGroupTable.vue';
import routes from '@/constants/routes';
import { ApprovalAggregatedBy, ApprovalBaseEntity, IApprovalBaseEntity } from '@libs/entities-lib/approvals/approvals-base';
import { IProgramEntity } from '@libs/entities-lib/program';
import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import { IApprovalTableEntity, IApprovalTableEntityData } from '@libs/entities-lib/approvals/approvals-table';
import { useApprovalTableStore } from '@/pinia/approval-table/approval-table';
import mixins from 'vue-typed-mixins';
import handleUniqueNameSubmitError from '@/ui/mixins/handleUniqueNameSubmitError';
import _isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';

export default mixins(handleUniqueNameSubmitError).extend({
  name: 'CreateEditApprovals',

  components: {
    ApprovalGroupTable,
    RcPageContent,
    VTextFieldWithValidation,
    VAutocompleteWithValidation,
    RcTabs,
    RcTab,
  },

  async beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext) {
    this.isEditMode ? await this.beforeLeavingEdit(to, from, next) : await this.beforeLeavingCreate(to, from, next);
  },

  data() {
    return {
      languageMode: 'en',
      programs: [] as IProgramEntity[],
      isSaving: false,
      isActive: true,
      approval: {} as IApprovalTableEntity | IApprovalBaseEntity, // TODO replace IApprovalBaseEntity by IApprovalTemplate when working on this story
      selectedProgram: null as IProgramEntity,
      tablesForCurrentEvent: [] as IApprovalTableEntityData[],
      isProgramLoading: false,
      uniqueNameErrorCode: 'errors.a-table-with-this-name-already-exists',
      redirectedFromSave: false,
      backupUpperForm: null,
      loading: false,
      groupHasChanged: false, // if group is being edited and values have changed
      ApprovalAggregatedBy,
      showNoGroupErr: false,
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        name: {
          required: true,
          max: MAX_LENGTH_MD,
          customValidator: { isValid: this.isNameUnique, messageKey: 'validations.alreadyExists' },
        },
        program: {
          required: true,
        },
        aggregatedBy: {
          required: true,
        },
      };
    },

    title(): TranslateResult {
      if (this.isTableMode) {
        return this.isEditMode ? this.$t('approvals.edit_table') : this.$t('approvals.create_table');
      }
      return this.isEditMode ? this.$t('approvals.edit_template') : this.$t('approvals.create_template');
    },

    supportedLanguages() {
      return SUPPORTED_LANGUAGES_INFO;
    },

    isEditMode(): boolean {
      return this.$route.name === routes.events.approvals.edit.name;
    },

    isTableMode(): boolean {
      return this.$route.name === routes.events.approvals.create.name || this.$route.name === routes.events.approvals.edit.name;
    },

    getStatusClasses(): string {
      return this.isActive ? 'status_success white--text' : 'grey lighten-3 black--text';
    },

    availablePrograms(): Array<IProgramEntity> {
      let availablePrograms = this.programs;
      if (this.tablesForCurrentEvent.length > 0) {
        const usedPrograms = this.tablesForCurrentEvent.map((t) => t.programId);
        if (this.isEditMode) {
          // should return active programs not already used or the current one (even if inactive)
          availablePrograms = availablePrograms?.filter((p) => (p.status === Status.Active || p.id === this.backupUpperForm?.programId)
            && (!usedPrograms.includes(p.id) || p.id === this.backupUpperForm?.programId));
        } else {
          availablePrograms = availablePrograms.filter((p) => p.status === Status.Active && !usedPrograms.includes(p.id));
        }
        return _sortBy(availablePrograms, (program) => this.$m(program.name));
      }
      return _sortBy(availablePrograms.filter((p) => p.status === Status.Active), (program) => this.$m(program.name));
    },

    disabledStatus(): boolean {
      if (this.selectedProgram) {
        return this.selectedProgram.status === Status.Inactive;
      } return false;
    },

    approvalHasGroups(): boolean {
      return this.approval.groups.filter((i) => i.addMode === false).length > 0;
    },

    currentlyEditingGroup(): boolean {
      return this.approval.groups.filter((i) => i.editMode === true).length > 0;
    },

    currentlyAddingGroup(): boolean {
      return this.approval.groups.filter((i) => i.addMode === true).length > 0;
    },

    eventId(): string {
      return this.$route.params.id;
    },

    approvalId(): string {
      return this.$route.params.approvalId;
    },

    changesInEdit(): boolean {
      if (this.isTableMode) {
        return !_isEqual(this.backupUpperForm, {
          name: { ...this.approval.name },
          programId: (this.approval as IApprovalTableEntity).programId,
          aggregatedByType: this.approval.aggregatedByType,
          approvalBaseStatus: this.approval.approvalBaseStatus,
        });
      }
      return false;
    },

    disableUpperForm(): boolean {
      return this.currentlyEditingGroup || (this.isEditMode && this.currentlyAddingGroup);
    },
  },

  watch: {
    isActive(newStatus) {
      this.setApprovalStatus(newStatus);
    },
  },

  async created() {
    if (this.isTableMode) {
      this.loading = true;
      this.isEditMode ? await this.initTableDataEdit() : await this.initTableDataCreate();
      this.loading = false;
    } else {
      this.approval = new ApprovalBaseEntity();
    }
  },

  methods: {
    async loadEventPrograms(eventId: string): Promise<void> {
      this.programs = await this.$services.programs.getAllIncludingInactive({ eventId });
    },

    async loadEventTables(eventId: string): Promise<void> {
      this.tablesForCurrentEvent = await this.$services.approvalTables.getApprovalsTableByEventId(eventId);
    },

    async createTable() {
      this.approval.fillEmptyMultilingualAttributes();
      try {
        await useApprovalTableStore().createApprovalTable(this.approval as IApprovalTableEntity);
        this.redirectedFromSave = true;
        await this.$router.push({ name: routes.events.approvals.home.name });
      } catch (e) {
        this.handleSubmitError(e);
      }
    },

    async createTemplate() {
      // TODO in a next story
    },

    async editTable() {
      try {
        const res = await useApprovalTableStore().editApprovalTable(this.approval as IApprovalTableEntity);
        if (res) {
          this.$toasted.global.success(this.$t('approval_table.edit.success'));
          this.createBackupApproval(res);
        }
      } catch (e) {
        this.handleSubmitError(e);
      }
    },

    async editTemplate() {
      // TODO in a next story
    },

    async submit(): Promise<void> {
      if (!this.approvalHasGroups) {
        this.showNoGroupErr = true;
      }
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid && this.approvalHasGroups) {
        this.isSaving = true;
        if (this.isEditMode) {
          this.isTableMode ? await this.editTable() : await this.editTemplate();
        } else {
          this.isTableMode ? await this.createTable() : await this.createTemplate();
        }
        this.isSaving = false;
      } else {
        await this.$nextTick();
        helpers.scrollToFirstError('scrollAnchor');
      }
    },

    setLanguageMode(lang: string) {
      this.languageMode = lang;
      this.approval.fillEmptyMultilingualAttributes();
    },

    setProgram(program: IProgramEntity) {
      (this.approval as IApprovalTableEntity).setProgramId(program.id);
      this.selectedProgram = program;
    },

    cancel() {
      if (this.isTableMode) {
        this.$router.push({ name: routes.events.approvals.home.name });
      }
    },

    setApprovalStatus(status: boolean) {
      this.approval.approvalBaseStatus = status ? Status.Active : Status.Inactive;
    },

    async loadProgramsAndEventTables() {
      this.isProgramLoading = true;
      await this.loadEventPrograms(this.eventId);
      await this.loadEventTables(this.eventId);
      this.isProgramLoading = false;
    },

    async initTableDataCreate() {
      this.approval = new ApprovalTableEntity();
      (this.approval as IApprovalTableEntity).eventId = this.eventId;
      await this.loadProgramsAndEventTables();
    },

    async initTableDataEdit() {
      const approval = await useApprovalTableStore().fetch(this.approvalId);
      this.approval = new ApprovalTableEntity(approval);
      (this.approval as IApprovalTableEntity).eventId = this.eventId;
      await this.loadProgramsAndEventTables();
      this.createBackupApproval(this.approval as IApprovalTableEntity);

      this.selectedProgram = this.availablePrograms.find((p) => p.id === this.backupUpperForm.programId);
      this.isActive = this.approval.approvalBaseStatus === Status.Active;
    },

    createBackupApproval(approval: IApprovalTableEntity | IApprovalTableEntityData) {
      this.backupUpperForm = cloneDeep({
        name: approval.name,
        programId: approval.programId,
        aggregatedByType: approval.aggregatedByType,
        approvalBaseStatus: approval.approvalBaseStatus,
      });
    },

    async beforeLeavingCreate(to: Route, from: Route, next: NavigationGuardNext) {
      const isDirty = (this.$refs?.form as VForm)?.flags.changed;

      if (this.redirectedFromSave) { // If redirecting after create
        next();
        return;
      }

      if (!isDirty && !this.approvalHasGroups) { // If nothing has changed
        next();
        return;
      }

      const leavingConfirmed = await this.$confirm({
        title: this.$t('confirmLeaveDialog.title'),
        messages: this.$t('confirmLeaveDialog.message_1'),
      });

      if (!isDirty && this.approvalHasGroups && leavingConfirmed) { // If at least a group has been created
        next();
        return;
      }

      if (isDirty && leavingConfirmed) { // If program, name or aggregated by has been changed
        next();
      }
    },

    async beforeLeavingEdit(to: Route, from: Route, next: NavigationGuardNext) {
      const isDirty = this.changesInEdit || this.groupHasChanged;

      if (!isDirty) { // If nothing has changed
        next();
        return;
      }

      const leavingConfirmed = await this.$confirm({
        title: this.$t('confirmLeaveDialog.title'),
        messages: this.$t('confirmLeaveDialog.message_1'),
      });

      if (isDirty && leavingConfirmed) {
        next();
      }
    },

    refreshApproval(approval: IApprovalTableEntityData) {
      this.approval = new ApprovalTableEntity(approval);
    },

    handleGroupDeteted() {
      this.showNoGroupErr = !this.approvalHasGroups;
    },
  },
});
</script>

<style scoped lang="scss">
.table-wrapper {
  border: 1px solid var(--v-grey-lighten2);
  margin-top: 32px;
  margin-bottom: 32px;
  padding: 30px;
  border-radius: 4px;
}

.approval-status {
  border-radius: 4px;
  padding: 8px;
  height: 48px;
}

.tableContainer {
  padding-top: 24px;
  margin: 0 -16px;
}
</style>
