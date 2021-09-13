<template>
  <ValidationObserver ref="form" v-slot="{ failed, dirty }" slim>
    <rc-page-content
      v-if="!loading"
      :title="isAddMode ? $t('caseFile.financialAssistance.create.title') : $t('caseFile.financialAssistance.details.title')"
      data-test="page-title">
      <v-row justify="center">
        <v-col cols="8">
          <!-- Warning -->
          <message-box v-if="showWarning" icon="mdi-alert" :message="$t('caseFile.financialAssistance.warning.program.eligibility')" />
          <!-- Form -->
          <v-sheet v-if="!isDetailsMode" rounded outlined class="pa-8 mb-8">
            <create-edit-financial-assistance-form
              :financial-assistance.sync="financialAssistance"
              :financial-assistance-tables="financialTables"
              :program="selectedProgram"
              :is-edit-mode="isEditMode"
              data-test="financial-assistance-form"
              @updateSelectedData="updateSelectedData" />
            <v-row v-if="isEditMode" justify="end">
              <v-btn data-test="cancel" class="mr-4" @click.stop="$router.back()">
                {{ $t('common.cancel') }}
              </v-btn>
              <v-btn
                color="primary"
                data-test="save"
                class="mr-4"
                :loading="loading"
                :disabled="failed || !dirty || isDisabled || showWarning"
                @click.stop="saveFinancialAssistance">
                {{ submitLabel }}
              </v-btn>
            </v-row>
          </v-sheet>
          <v-sheet v-else rounded outlined class="pa-2 mb-8">
            <view-financial-assistance-details
              :financial-assistance.sync="financialAssistance"
              :financial-assistance-table="selectedTable"
              :program="selectedProgram"
              data-test="financial-assistance-details" />
          </v-sheet>
          <!-- Add payment line -->
          <v-row justify="center">
            <v-col cols="12">
              <div class="flex-row justify-space-between">
                <span class="rc-body16 fw-bold">
                  {{ $t('caseFile.financialAssistance.paymentLines') }}
                </span>

                <v-btn
                  v-if="canAddNewLines"
                  color="primary"
                  data-test="financial-addPaymentLineBtn"
                  :disabled="!selectedProgram"
                  @click="editPaymentLine(null)">
                  {{ $t('caseFile.financialAssistance.addNewPaymentLines') }}
                </v-btn>
              </div>
            </v-col>
            <v-col cols="12">
              <payment-line-group-list
                v-if="nbPaymentLines > 0"
                :disable-delete-button="nbPaymentLines === 1"
                :payment-groups="activePaymentGroups"
                :transaction-approval-status="financialAssistance.approvalStatus"
                :items="items"
                data-test="paymentGroupList"
                @edit-payment-line="editPaymentLine"
                @delete-payment-line="deletePaymentLine" />
              <div v-else class="rc-body14">
                {{ $t('caseFile.financialAssistance.noPaymentLines') }}
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <!-- Actions -->
      <template slot="actions">
        <v-btn data-test="cancel" @click.stop="back()">
          {{ isAddMode ? $t('common.cancel') : $t('financialAssistance.back') }}
        </v-btn>
        <v-btn
          v-if="isAddMode"
          color="primary"
          data-test="save"
          :loading="loading"
          :disabled="failed || !dirty || isDisabled || showWarning"
          @click.stop="saveFinancialAssistance">
          {{ submitLabel }}
        </v-btn>
      </template>

      <create-edit-payment-line-dialog
        v-if="showAddPaymentLineForm"
        :show.sync="showAddPaymentLineForm"
        :program="selectedProgram"
        :items="items"
        :current-line="lineToEdit"
        :current-group="groupToEdit"
        data-test="case-file-financial-assistance-payment-line-dialog"
        @submit="onSubmitPaymentLine($event)"
        @cancelChange="showAddPaymentLineForm = false" />
    </rc-page-content>
  </ValidationObserver>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageContent } from '@crctech/component-library';
import { TranslateResult } from 'vue-i18n';
import _find from 'lodash/find';
import { Route, NavigationGuardNext } from 'vue-router';
import { EPaymentModalities } from '@/entities/program/program.types';
import {
  ApprovalStatus,
  FinancialAssistancePaymentEntity,
  FinancialAssistancePaymentGroup,
  IFinancialAssistancePaymentEntity,
  IFinancialAssistancePaymentGroup,
  IFinancialAssistancePaymentLine,
} from '@/entities/financial-assistance-payment';
import
{
  IFinancialAssistanceTableEntity,
  IFinancialAssistanceTableCombined,
  IFinancialAssistanceTableItem,
} from '@/entities/financial-assistance';
import { Status } from '@/entities/base/index';
import { ICaseFileEntity, IdentityAuthenticationStatus, ValidationOfImpactStatus } from '@/entities/case-file';
import MessageBox from '@/ui/shared-components/MessageBox.vue';
import PaymentLineGroupList from './PaymentLineGroupList.vue';
import { IProgramEntity } from '@/entities/program';
import routes from '@/constants/routes';
import CreateEditFinancialAssistanceForm from './CreateEditFinancialAssistanceForm.vue';
import ViewFinancialAssistanceDetails from './ViewFinancialAssistanceDetails.vue';
import CreateEditPaymentLineDialog from './CreateEditPaymentLineDialog.vue';
import { VForm } from '@/types';
import helpers from '@/ui/helpers';

export default Vue.extend({
  name: 'CreateEditFinancialAssistance',

  components: {
    RcPageContent,
    CreateEditFinancialAssistanceForm,
    MessageBox,
    CreateEditPaymentLineDialog,
    PaymentLineGroupList,
    ViewFinancialAssistanceDetails,
  },

  async beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext) {
    await helpers.confirmBeforeLeaving(this, (this.$refs.form as VForm).flags.dirty, next);
  },

  data() {
    return {
      financialAssistanceLoading: false,
      financialAssistance: null as FinancialAssistancePaymentEntity,
      financialTables: [] as IFinancialAssistanceTableEntity[],
      selectedProgram: null as IProgramEntity,
      selectedTable: null as IFinancialAssistanceTableEntity,
      programs: null as IProgramEntity[],
      lineToEdit: null as IFinancialAssistancePaymentLine,
      groupToEdit: null as IFinancialAssistancePaymentGroup,
      showAddPaymentLineForm: false,
      showConfirm: false,
      isSaving: false,
      saved: false,
      validationFailed: false,
      loading: false,
      isDetailsMode: this.$route.name === routes.caseFile.financialAssistance.details.name,
      isEditMode: this.$route.name === routes.caseFile.financialAssistance.edit.name,
      isAddMode: this.$route.name === routes.caseFile.financialAssistance.create.name,
    };
  },

  computed: {
    activePaymentGroups(): IFinancialAssistancePaymentGroup[] {
      if (!this.financialAssistance?.groups?.length) return [];
      return this.financialAssistance?.groups.filter((g) => g.status === Status.Active);
    },

    submitLabel(): TranslateResult {
      return this.isEditMode ? this.$t('common.buttons.save') : this.$t('common.buttons.create');
    },

    showWarning() : boolean {
      return !(this.isImpacted && this.isAuthenticated);
    },

    isAuthenticated(): boolean {
      if (this.selectedProgram?.eligibilityCriteria?.authenticated) {
        return this.caseFile?.identityAuthentication?.status === IdentityAuthenticationStatus.Passed;
      }
      return true;
    },

    isImpacted(): boolean {
      if (this.selectedProgram?.eligibilityCriteria?.impacted) {
        return this.caseFile?.impactStatusValidation?.status === ValidationOfImpactStatus.Impacted;
      }

      return true;
    },

    isDisabled() : boolean {
      return !(this.financialAssistance.validate() === true && this.activePaymentGroups.length > 0);
    },

    canAddNewLines(): boolean {
      return this.$hasLevel('level1') && this.financialAssistance.approvalStatus === ApprovalStatus.New;
    },

    caseFile(): ICaseFileEntity {
      return this.$storage.caseFile.getters.get(this.$route.params.id).entity;
    },

    items(): Array<IFinancialAssistanceTableItem> {
      return this.$storage.financialAssistance.getters.items();
    },

    nbPaymentLines() : number {
      return this.activePaymentGroups?.map((g) => g.lines.filter((l) => l.status === Status.Active))
        .reduce((acc, element) => acc + element.length, 0);
    },
  },

  async created() {
    this.loading = true;
    if (this.$route.params.financialAssistancePaymentId) {
      this.financialAssistance = new FinancialAssistancePaymentEntity(
        (await this.$storage.financialAssistancePayment.actions.fetch(this.$route.params.financialAssistancePaymentId)).entity,
      );
    } else {
      this.financialAssistance = new FinancialAssistancePaymentEntity();
      this.financialAssistance.caseFileId = this.$route.params.id;
    }

    await this.$storage.financialAssistanceCategory.actions.fetchAll();
    await this.searchTables();
    this.loading = false;
  },

  methods: {
    async searchTables() {
      await this.$storage.caseFile.actions.fetch(this.$route.params.id);
      if (this.caseFile) {
        const tableData = await this.$storage.financialAssistance.actions.search({
          filter: {
            'Entity/EventId': this.caseFile.eventId,
          },
        });
        const { ids } = tableData;

        this.financialTables = this.$storage.financialAssistance.getters.getByIds(ids).map((t : IFinancialAssistanceTableCombined) => t.entity)
          .filter((t: IFinancialAssistanceTableEntity) => t.status === Status.Active);

        await this.updateSelectedData(this.financialTables
          .find((x) => x.id === this.financialAssistance.financialAssistanceTableId));
      }
    },

    async saveFinancialAssistance() {
      const result = this.isEditMode ? (
        await this.$storage.financialAssistancePayment.actions.editFinancialAssistancePayment(this.financialAssistance))
        : (await this.$storage.financialAssistancePayment.actions.addFinancialAssistancePayment(this.financialAssistance)
        );
      if (result) {
        this.$toasted.global.success(
          this.isEditMode ? this.$t('financialAssistancePayment_edit.success') : this.$t('financialAssistancePayment_create.success'),
        );
        // so we can leave without warning
        (this.$refs.form as VForm).reset();
        // reset actually takes a few ms but isnt awaitable...
        setTimeout(() => {
          this.$router.replace({
            name: routes.caseFile.financialAssistance.details.name,
            params: {
              financialAssistancePaymentId: result.id,
            },
          });
        }, 50);
      }
    },

    editPaymentLine(event : { line: IFinancialAssistancePaymentLine, group: IFinancialAssistancePaymentGroup }) {
      this.lineToEdit = event?.line;
      this.groupToEdit = event?.group;
      this.showAddPaymentLineForm = true;
    },

    async updateSelectedData(table: IFinancialAssistanceTableEntity) {
      await this.updateSelectedProgram(table);
      this.updateSelectedTable(table);
    },

    async updateSelectedProgram(table: IFinancialAssistanceTableEntity) {
      const selectedProgramId = table?.programId;
      if (selectedProgramId && this.selectedProgram?.id !== selectedProgramId) {
        const combinedProgram = await this.$storage.program.actions.fetch({ id: selectedProgramId, eventId: this.caseFile.eventId });
        this.selectedProgram = combinedProgram.entity;
      }
    },

    updateSelectedTable(table: IFinancialAssistanceTableEntity) {
      this.selectedTable = table;
      if (this.selectedTable) {
        const tableWithMetadata = this.$storage.financialAssistance.getters.get(table.id);
        const categories = this.$storage.financialAssistanceCategory.getters.getAll().map((c) => c.entity);
        this.$storage.financialAssistance.mutations.setFinancialAssistance(tableWithMetadata, categories, this.selectedProgram);
      }
    },

    back(): void {
      this.$router.replace({
        name: routes.caseFile.financialAssistance.home.name,
      });
    },

    async onSubmitPaymentLine(submittedPaymentGroup: IFinancialAssistancePaymentGroup) {
      if (!this.isAddMode) {
        await this.savePaymentLine(submittedPaymentGroup);
      } else {
        this.mergePaymentLine(submittedPaymentGroup);
      }
    },

    mergePaymentLine(submittedPaymentGroup: IFinancialAssistancePaymentGroup) {
      if (this.lineToEdit) {
        // we remove the original line before we re-insert it in the right group
        this.groupToEdit.lines = this.groupToEdit.lines.filter((l) => l !== this.lineToEdit);
        if (!this.groupToEdit.lines.length) {
          this.financialAssistance.groups = this.financialAssistance.groups.filter((g) => g !== this.groupToEdit);
        }
      }

      // Find the payment group based on modality and payee
      const paymentInfo = submittedPaymentGroup.groupingInformation;
      const paymentGroup = _find(this.activePaymentGroups, (group: IFinancialAssistancePaymentGroup) => {
        const groupInfo = group.groupingInformation;
        if (paymentInfo.modality === EPaymentModalities.Cheque || paymentInfo.modality === EPaymentModalities.DirectDeposit) {
          return groupInfo.modality === paymentInfo.modality
          && groupInfo.payeeType === paymentInfo.payeeType
          && groupInfo.payeeName === paymentInfo.payeeName;
        }

        return groupInfo.modality === paymentInfo.modality
        && groupInfo.payeeType === paymentInfo.payeeType;
      });

      // If they payment group is found, add the payment line to its array
      if (paymentGroup) {
        paymentGroup.lines.push(...submittedPaymentGroup.lines);
      // If no payment group is found, create a new payment group
      } else {
        const newGroup = new FinancialAssistancePaymentGroup();
        newGroup.status = Status.Active;
        newGroup.groupingInformation = paymentInfo;
        newGroup.paymentStatus = submittedPaymentGroup.paymentStatus;
        newGroup.lines = submittedPaymentGroup.lines;
        this.financialAssistance.groups.push(newGroup);
      }
      this.showAddPaymentLineForm = false;
    },

    async savePaymentLine(submittedPaymentGroup: IFinancialAssistancePaymentGroup) {
      let newVersion = null as IFinancialAssistancePaymentEntity;
      if (!submittedPaymentGroup.lines[0].id) {
        newVersion = await this.$storage.financialAssistancePayment.actions.addFinancialAssistancePaymentLine(
          this.financialAssistance.id, submittedPaymentGroup,
        );
      } else {
        newVersion = await this.$storage.financialAssistancePayment.actions.editFinancialAssistancePaymentLine(
          this.financialAssistance.id, submittedPaymentGroup,
        );
      }
      if (newVersion) {
        this.showAddPaymentLineForm = false;
        this.financialAssistance.groups = newVersion.groups;
        this.$toasted.global.success(
          this.$t(!submittedPaymentGroup.lines[0].id
            ? 'financialAssistancePayment_lineAdded.success' : 'financialAssistancePayment_lineModified.success'),
        );
      }
    },

    async deletePaymentLine(event : { line: IFinancialAssistancePaymentLine, group: IFinancialAssistancePaymentGroup }) {
      if (event.line.id) {
        const newVersion = await this.$storage.financialAssistancePayment.actions.deleteFinancialAssistancePaymentLine(
          this.financialAssistance.id, event.line.id,
        );
        if (newVersion) {
          this.financialAssistance.groups = newVersion.groups;
          this.$toasted.global.success(this.$t('caseFile.financialAssistance.toast.paymentLineDeleted'));
        }
      } else {
        event.group.lines = event.group.lines.filter((l) => l !== event.line);
        if (!event.group.lines.length) {
          this.financialAssistance.groups = this.financialAssistance.groups.filter((g) => g !== event.group);
        }
      }
    },
  },
});
</script>

<style>

</style>
