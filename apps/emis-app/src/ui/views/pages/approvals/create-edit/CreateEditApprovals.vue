<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <rc-page-content
      :title="title"
      :show-add-button="false">
      <v-container>
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
                  :disabled="isProgramLoading"
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
                  :label="`${isTableMode ? $t('approval.table_name') : $t('approval.template_name')} *`"
                  :rules="rules.name"
                  @input="resetAsUnique()" />
              </v-col>

              <v-col cols="3" md="4" sm="5">
                <div :class="`flex-row approval-status py-2 pl-5 ${getStatusClasses}`">
                  <span :class="`rc-body14 ${isActive ? 'white--text' : 'black--text'} ml-4`" data-test="approval-status">
                    {{ isActive ?
                      `${$t('common.status')} ${$t('enums.Status.Active').toUpperCase()}`
                      : ` ${$t('common.status')} ${$t('enums.Status.Inactive').toUpperCase()}` }}
                  </span>

                  <validation-provider slim>
                    <v-switch
                      v-model="isActive"
                      class="mt-0 ml-auto mr-3 pt-0"
                      flat
                      :disabled="disabledStatus"
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
              <v-radio-group v-model="approval.aggregatedByType" :error-messages="errors" row>
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

            <v-row />
          </v-col>
        </v-row>
      </v-container>

      <div class="tableContainer">
        <approval-group-table :approval="approval" :is-edit="false" />
      </div>

      <template #actions>
        <v-btn :disabled="isSaving" data-test="approval-cancelBtn" @click="cancel()">
          {{ $t('common.buttons.cancel') }}
        </v-btn>

        <v-btn
          color="primary"
          :disabled="failed || !approvalHasGroups || currentlyEditing"
          data-test="approval-saveBtn"
          :loading="isSaving"
          @click="submit()">
          {{ $t('common.buttons.create') }}
        </v-btn>
      </template>
    </rc-page-content>
  </validation-observer>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';
import { NavigationGuardNext, Route } from 'vue-router';
import {
  RcPageContent, RcTab, RcTabs, VAutocompleteWithValidation, VTextFieldWithValidation,
} from '@libs/component-lib/components';
import helpers from '@/ui/helpers/helpers';
import { SUPPORTED_LANGUAGES_INFO } from '@/constants/trans';
import { VForm } from '@libs/shared-lib/types';
import { ApprovalTableEntity } from '@libs/entities-lib/approvals/approvals-table/approvalTable';
import { Status } from '@libs/entities-lib/base';
import _sortBy from 'lodash/sortBy';
import ApprovalGroupTable from '@/ui/views/pages/approvals/create-edit/ApprovalGroupTable.vue';
import routes from '@/constants/routes';
import { ApprovalAggregatedBy, ApprovalBaseEntity, IApprovalBaseEntity } from '@libs/entities-lib/approvals/approvals-base';
import { IProgramEntity } from '@libs/entities-lib/program';
import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import { IApprovalTableEntity, IApprovalTableEntityData } from '@libs/entities-lib/approvals/approvals-table';
import mixins from 'vue-typed-mixins';
import handleUniqueNameSubmitError from '@/ui/mixins/handleUniqueNameSubmitError';

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
    const isDirty = (this.$refs.form as VForm).flags.changed;

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
      ApprovalAggregatedBy,
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
        return this.$t('approvals.create_table');
      }
      return this.$t('approvals.create_template');
    },

    supportedLanguages() {
      return SUPPORTED_LANGUAGES_INFO;
    },

    isEditMode(): boolean {
      return false;
    },

    isTableMode(): boolean {
      return this.$route.name === routes.events.approvals.create.name;
    },

    getStatusClasses(): string {
      return this.isActive ? 'status_success white--text' : 'grey lighten-3 black--text';
    },

    availablePrograms(): Array<IProgramEntity> {
      if (this.tablesForCurrentEvent.length > 0) {
        const usedPrograms = this.tablesForCurrentEvent.map((t) => t.programId);
        const availablePrograms = this.programs.filter((p) => !usedPrograms.includes(p.id));
        return _sortBy(availablePrograms, (program) => this.$m(program.name));
      }
      return _sortBy(this.programs, (program) => this.$m(program.name));
    },

    disabledStatus(): boolean {
      if (this.selectedProgram) {
        return this.selectedProgram.status === Status.Inactive;
      } return false;
    },

    approvalHasGroups(): boolean {
      return this.approval.groups.filter((i) => i.addMode === false).length > 0;
    },

    currentlyEditing(): boolean {
      return this.approval.groups.filter((i) => i.editMode === true).length > 0;
    },
  },

  watch: {
    isActive(newStatus) {
      this.setApprovalStatus(newStatus);
    },
  },

  async created() {
    if (this.isTableMode) {
      this.approval = new ApprovalTableEntity();
      (this.approval as IApprovalTableEntity).eventId = this.$route.params.id;
      this.isProgramLoading = true;
      await this.loadEventPrograms(this.$route.params.id);
      await this.loadEventTables(this.$route.params.id);
      this.isProgramLoading = false;
    } else {
      this.approval = new ApprovalBaseEntity();
    }
  },

  methods: {
    async loadEventPrograms(eventId: string): Promise<void> {
      this.programs = await this.$services.programs.getAll({ eventId });
    },

    async loadEventTables(eventId: string): Promise<void> {
      this.tablesForCurrentEvent = await this.$services.approvalTables.getApprovalsTableByEventId(eventId);
    },

    async createTable() {
      this.isSaving = true;
      this.approval.fillEmptyMultilingualAttributes();
      try {
        await this.$storage.approvalTable.actions.createApprovalTable(this.approval as IApprovalTableEntity);
        this.redirectedFromSave = true;
        await this.$router.push({ name: routes.events.approvals.home.name });
      } catch (e) {
        this.handleSubmitError(e);
      } finally {
        this.isSaving = false;
      }
    },

    async createTemplate() {
      // TODO in a next story
    },

    async editTable() {
      // TODO in a next story
    },

    async editTemplate() {
      // TODO in a next story
    },

    async submit(): Promise<void> {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        if (this.isEditMode) {
          this.isTableMode ? await this.editTable() : await this.editTemplate();
        } else {
          this.isTableMode ? await this.createTable() : await this.createTemplate();
        }
      } else {
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
      this.approval.status = status ? Status.Active : Status.Inactive;
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
