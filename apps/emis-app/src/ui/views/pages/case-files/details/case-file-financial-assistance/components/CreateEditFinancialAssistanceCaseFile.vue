<template>
  <div class="full-height">
    <rc-page-loading v-if="loading" />
    <validation-observer ref="form" v-slot="{ failed, dirty }" slim>
      <rc-page-content
        v-if="!loading"
        outer-scroll
        :title="isAddMode ? $t('caseFile.financialAssistance.create.title') : $t('caseFile.financialAssistance.details.title')"
        data-test="page-title">
        <v-row justify="center">
          <v-col cols="8">
            <!-- Warning -->
            <message-box
              v-if="showWarning"
              icon="mdi-alert"
              :message="$t('caseFile.financialAssistance.warning.program.eligibility.household')" />
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
                :id="id"
                :financial-assistance.sync="financialAssistance"
                :financial-assistance-table="selectedTable"
                :program="selectedProgram"
                :is-deleting-payment.sync="isDeletingPayment"
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
                    :disabled="!selectedProgram || showWarning"
                    @click="editPaymentLine(null)">
                    {{ $t('caseFile.financialAssistance.addNewPaymentLines') }}
                  </v-btn>
                </div>
              </v-col>
              <v-col cols="12">
                <payment-line-group-list
                  v-if="nbPaymentLines > 0"
                  :readonly="readonly"
                  :disable-delete-button="nbPaymentLines === 1"
                  :payment-groups="activePaymentGroups"
                  :transaction-approval-status="financialAssistance.approvalStatus"
                  :items="items"
                  :disable-submit-payment="dirty || !financialAssistance.id"
                  :program="selectedProgram"
                  data-test="paymentGroupList"
                  @submit-payment="onClickSubmitPayment"
                  @edit-payment-line="editPaymentLine"
                  @delete-payment-line="deletePaymentLine"
                  @cancel-payment-line="cancelPaymentLine"
                  @update-payment-status="updatePaymentStatus" />
                <div v-else class="rc-body14">
                  {{ $t('caseFile.financialAssistance.noPaymentLines') }}
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <!-- Actions -->
        <template slot="actions">
          <v-btn :color="isAddMode ? '' : 'primary'" data-test="cancel" :disabled="savingFinancialAssistance" @click.stop="back()">
            {{ isAddMode ? $t('common.cancel') : $t('financialAssistance.back') }}
          </v-btn>
          <v-btn
            v-if="isAddMode"
            color="primary"
            data-test="save"
            :loading="savingFinancialAssistance"
            :disabled="failed || !dirty || isDisabled || showWarning"
            @click.stop="saveFinancialAssistance">
            {{ submitLabel }}
          </v-btn>
        </template>

        <create-edit-payment-line-dialog
          v-if="showAddPaymentLineForm"
          :id="caseFileId"
          :show.sync="showAddPaymentLineForm"
          :program="selectedProgram"
          :items="items"
          :current-line="lineToEdit"
          :current-group="groupToEdit"
          :submitting-payment-line="submittingPaymentLine"
          :financial-assistance="financialAssistance"
          data-test="case-file-financial-assistance-payment-line-dialog"
          @submit="onSubmitPaymentLine($event)"
          @cancelChange="showAddPaymentLineForm = false" />
      </rc-page-content>
    </validation-observer>

    <submit-financial-assistance-payment-dialog
      v-if="showSubmitPaymentDialog"
      :show.sync="showSubmitPaymentDialog"
      :total-amount-to-submit.sync="totalAmountToSubmit"
      :approval-required="selectedProgram.approvalRequired"
      :program-id="selectedProgram.id"
      :event-id="event.id"
      :financial-assistance.sync="financialAssistance" />
  </div>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import { format } from 'date-fns';
import {
  RcPageContent, RcDialog, VCheckboxWithValidation, RcPageLoading, MessageBox,
} from '@libs/component-lib/components';
import { TranslateResult } from 'vue-i18n';
import _find from 'lodash/find';
import { Route, NavigationGuardNext } from 'vue-router';
import {
  ApprovalStatus,
  EPaymentCancellationReason,
  FinancialAssistancePaymentEntity,
  FinancialAssistancePaymentGroup,
  IFinancialAssistancePaymentEntity,
  IFinancialAssistancePaymentGroup,
  IFinancialAssistancePaymentLine,
  PaymentStatus,
} from '@libs/entities-lib/financial-assistance-payment';
import
{
  IFinancialAssistanceTableEntity,
  IFinancialAssistanceTableItem,
} from '@libs/entities-lib/financial-assistance';
import
{
  IAssessmentFormEntity,
  IAssessmentResponseEntity,
  AssociationType,
  CompletionStatus,
} from '@libs/entities-lib/assessment-template';
import { IdentityAuthenticationStatus, ValidationOfImpactStatus } from '@libs/entities-lib/case-file';
import { IProgramEntity } from '@libs/entities-lib/program';
import routes from '@/constants/routes';
import { EFilterKeyType } from '@libs/component-lib/types';
import { VForm, Status } from '@libs/shared-lib/types';
import helpers from '@/ui/helpers/helpers';
import SubmitFinancialAssistancePaymentDialog
  from '@/ui/views/pages/case-files/details/case-file-financial-assistance/components/SubmitFinancialAssistancePaymentDialog.vue';
import { useAssessmentFormStore } from '@/pinia/assessment-form/assessment-form';
import { useProgramStore } from '@/pinia/program/program';
import { UserRoles } from '@libs/entities-lib/user';
import { useAssessmentResponseStore } from '@/pinia/assessment-response/assessment-response';
import helper from '@libs/shared-lib/helpers/helpers';
import { useFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment';
import { useFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance';

import PaymentLineGroupList from './PaymentLineGroupList.vue';
import CreateEditFinancialAssistanceForm from './CreateEditFinancialAssistanceForm.vue';
import ViewFinancialAssistanceDetails from './ViewFinancialAssistanceDetails.vue';
import CreateEditPaymentLineDialog from './CreateEditPaymentLineDialog.vue';
import caseFileDetail from '../../caseFileDetail';

export default mixins(caseFileDetail).extend({
  name: 'CreateEditFinancialAssistanceCaseFile',

  components: {
    SubmitFinancialAssistancePaymentDialog,
    RcPageContent,
    CreateEditFinancialAssistanceForm,
    MessageBox,
    CreateEditPaymentLineDialog,
    PaymentLineGroupList,
    ViewFinancialAssistanceDetails,
    RcDialog,
    VCheckboxWithValidation,
    RcPageLoading,
  },

  async beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext) {
    // In DetailsMode we want to notify users to submit payment before they navigate away from the current page.
    // In EditMode we want to notify users to submit payment before they navigate away from the current page without changing anything,
    // but if the destination is Financial Assistance Details, this notification won't show.
    if ((to.name !== 'casefile.financialAssistance.edit' && to.name !== 'caseFile.financialAssistance.paymentLineDetails' && this.isDetailsMode && !this.isDeletingPayment)
      || (this.isEditMode && !(this.$refs.form as VForm).flags.dirty && to.name !== 'casefile.financialAssistance.details')) {
      await this.confirmBeforeLeavingWithoutSubmittingPayment(next, this.financialAssistance.approvalStatus);
    } else {
      await helpers.confirmBeforeLeaving(this, (this.$refs.form as VForm).flags.dirty, next);
    }
  },

  data() {
    return {
      financialAssistanceLoading: false,
      financialAssistance: null as FinancialAssistancePaymentEntity,
      financialTables: [] as IFinancialAssistanceTableEntity[],
      selectedProgram: null as IProgramEntity,
      selectedTable: null as IFinancialAssistanceTableEntity,
      lineToEdit: null as IFinancialAssistancePaymentLine,
      groupToEdit: null as IFinancialAssistancePaymentGroup,
      showAddPaymentLineForm: false,
      loading: false,
      isDetailsMode: this.$route.name === routes.caseFile.financialAssistance.details.name,
      isEditMode: this.$route.name === routes.caseFile.financialAssistance.edit.name,
      isAddMode: this.$route.name === routes.caseFile.financialAssistance.create.name,
      showSubmitPaymentDialog: false,
      submittingPayment: false,
      totalAmountToSubmit: '',
      submittingPaymentLine: false,
      savingFinancialAssistance: false,
      programAssessmentForms: [] as IAssessmentFormEntity[],
      caseFileAssessmentResponses: [] as IAssessmentResponseEntity[],
      isDeletingPayment: false,
    };
  },

  computed: {
    activePaymentGroups(): IFinancialAssistancePaymentGroup[] {
      if (!this.financialAssistance?.groups?.length) {
        return [];
      }
      return this.financialAssistance?.groups.filter((g) => g.status === Status.Active);
    },

    submitLabel(): TranslateResult {
      return this.isEditMode ? this.$t('common.buttons.save') : this.$t('common.buttons.create');
    },

    showWarning() : boolean {
      return !(this.isImpacted && this.isAuthenticated && this.hasCompletedAssessments && !this.hasBlockingAssessmentScore)
        && this.financialAssistance.approvalStatus !== ApprovalStatus.Approved;
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

    hasCompletedAssessments(): boolean {
      if (this.selectedProgram?.eligibilityCriteria?.completedAssessments) {
        const requiredAssessmentForms = this.programAssessmentForms
          .filter((f) => this.selectedProgram.eligibilityCriteria.completedAssessmentIds.some((cid) => cid === f.id));

        return requiredAssessmentForms
          .every((f) => this.caseFileAssessmentResponses.some((r) => r.assessmentFormId === f.id && r.completionStatus === CompletionStatus.Completed));
      }

      return true;
    },

    hasBlockingAssessmentScore(): boolean {
      if (!this.selectedProgram || !this.programAssessmentForms?.length) {
        return false;
      }
      for (let i = 0; i < this.caseFileAssessmentResponses.length; i += 1) {
        const response = this.caseFileAssessmentResponses[i];
        const form = this.programAssessmentForms.find((f) => f.id === response.assessmentFormId);
        if (form != null && response.completionStatus === CompletionStatus.Completed && response.totalScore != null
            && (form.scoringRanges || []).find((s) => s.restrictFinancial && s.minValue <= response.totalScore && s.maxValue >= response.totalScore)) {
          return true;
        }
      }
      return false;
    },

    isDisabled() : boolean {
      return !(this.financialAssistance.validate() === true && this.activePaymentGroups.length > 0);
    },

    canAddNewLines(): boolean {
      return !this.readonly && this.$hasLevel(UserRoles.level1) && this.financialAssistance.approvalStatus === ApprovalStatus.New;
    },

    items(): Array<IFinancialAssistanceTableItem> {
      return useFinancialAssistanceStore().mainItems;
    },

    nbPaymentLines() : number {
      return this.activePaymentGroups?.map((g) => g.lines.filter((l) => l.status === Status.Active))
        .reduce((acc, element) => acc + element.length, 0);
    },

  },

  async created() {
    this.loading = true;
    if (this.$route.params.financialAssistancePaymentId) {
      const faPayment = await useFinancialAssistancePaymentStore().fetch(this.$route.params.financialAssistancePaymentId);
      this.financialAssistance = new FinancialAssistancePaymentEntity(faPayment);
    } else {
      this.financialAssistance = new FinancialAssistancePaymentEntity();
      this.financialAssistance.caseFileId = this.$route.params.id;
    }

    await useFinancialAssistancePaymentStore().fetchFinancialAssistanceCategories();
    this.isEditMode || this.isAddMode ? await this.searchTables() : await this.fetchTable();
    await this.fetchAssessmentResponseByCaseFileId(this.caseFileId);

    this.loading = false;
    this.warnIfInvalid();
  },

  methods: {
    warnIfInvalid() {
      if (this.financialAssistance.approvalStatus === ApprovalStatus.New && this.selectedTable?.status === Status.Inactive) {
        this.$message({
          title: this.$t('caseFile.financialAssistance.tableInactive.title'),
          message: this.$t('caseFile.financialAssistance.tableInactive.message'),
        });
      }
    },

    async searchTables() {
      if (this.caseFile) {
        const tableData = await useFinancialAssistanceStore().search({ params: {
          filter: { 'Entity/EventId': { value: this.caseFile.eventId, type: EFilterKeyType.Guid } },
        },
        includeInactiveItems: true });
        const { ids } = tableData;

        this.financialTables = useFinancialAssistanceStore().getByIds(ids)
          .filter((t: IFinancialAssistanceTableEntity) => t.status === Status.Active || t.id === this.financialAssistance.financialAssistanceTableId);

        await this.updateSelectedData(this.financialTables
          .find((x) => x.id === this.financialAssistance.financialAssistanceTableId));
      }
    },

    async fetchTable() {
      if (this.caseFile) {
        const table = await useFinancialAssistanceStore().fetch(this.financialAssistance.financialAssistanceTableId);
        if (table) {
          this.financialTables = [table];
          await this.updateSelectedData(table);
        }
      }
    },

    async saveFinancialAssistance() {
      this.savingFinancialAssistance = true;
      const result = this.isEditMode ? (
        await useFinancialAssistancePaymentStore().editFinancialAssistancePayment(this.financialAssistance))
        : (await useFinancialAssistancePaymentStore().addFinancialAssistancePayment(this.financialAssistance)
        );
      if (result) {
        this.$toasted.global.success(
          this.isEditMode ? this.$t('financialAssistancePayment_edit.success') : this.$t('financialAssistancePayment_create.success'),
        );
        // so we can leave without warning
        (this.$refs.form as VForm).reset();
        // reset actually takes a few ms but isnt awaitable...
        await helpers.timeout(500);

        await this.$router.replace({
          name: routes.caseFile.financialAssistance.details.name,
          params: {
            financialAssistancePaymentId: result.id,
          },
        });
      }
      this.savingFinancialAssistance = false;
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
        const originalProgram = this.selectedProgram;

        const program = await useProgramStore().fetch({ id: selectedProgramId, eventId: this.caseFile.eventId });
        this.selectedProgram = program;
        await this.fetchAssessmentFormByProgramId(this.selectedProgram.id);

        if (originalProgram) {
          this.makePaymentName();
        }
      }
    },

    updateSelectedTable(table: IFinancialAssistanceTableEntity) {
      this.selectedTable = table;
      if (this.selectedTable) {
        const tableEntity = useFinancialAssistanceStore().getById(table.id);
        const categories = useFinancialAssistancePaymentStore().getFinancialAssistanceCategories(false);
        useFinancialAssistanceStore().setFinancialAssistance({
          fa: tableEntity, categories, newProgram: this.selectedProgram, removeInactiveItems: false,
        });
      }
    },

    back(): void {
      this.$router.replace({
        name: routes.caseFile.financialAssistance.home.name,
      });
    },

    async onSubmitPaymentLine(submittedPaymentGroup: IFinancialAssistancePaymentGroup) {
      this.submittingPaymentLine = true;
      if (!this.isAddMode) {
        await this.savePaymentLine(submittedPaymentGroup);
      } else {
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((s) => setTimeout(s, 1000)); // force user to stay on the dialog, in order to avoid hitting the Create button underneath
        this.mergePaymentLine(submittedPaymentGroup);
        this.makePaymentName();
      }
      this.submittingPaymentLine = false;
    },

    onClickSubmitPayment(event: { total: string }) {
      this.totalAmountToSubmit = event.total;
      this.showSubmitPaymentDialog = true;
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
        if (FinancialAssistancePaymentGroup.showPayee(paymentInfo.modality)) {
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
      let updatedFinancialAssistance = null as IFinancialAssistancePaymentEntity;
      if (!submittedPaymentGroup.lines[0].id) {
        updatedFinancialAssistance = await useFinancialAssistancePaymentStore().addFinancialAssistancePaymentLine(this.financialAssistance.id, submittedPaymentGroup);
      } else {
        updatedFinancialAssistance = await useFinancialAssistancePaymentStore().editFinancialAssistancePaymentLine(this.financialAssistance.id, submittedPaymentGroup);
      }
      if (updatedFinancialAssistance) {
        this.showAddPaymentLineForm = false;
        this.financialAssistance.groups = updatedFinancialAssistance.groups;
        this.$toasted.global.success(
          this.$t(!submittedPaymentGroup.lines[0].id
            ? 'financialAssistancePayment_lineAdded.success' : 'financialAssistancePayment_lineModified.success'),
        );

        if (this.financialAssistance.approvalStatus === ApprovalStatus.New) {
          this.submitPaymentNameUpdate();
        }
      }
    },

    async deletePaymentLine(event : { line: IFinancialAssistancePaymentLine, group: IFinancialAssistancePaymentGroup }) {
      if (event.line.id) {
        const updatedFinancialAssistance = await useFinancialAssistancePaymentStore().deleteFinancialAssistancePaymentLine(this.financialAssistance.id, event.line.id);
        if (updatedFinancialAssistance) {
          this.financialAssistance.groups = updatedFinancialAssistance.groups;
          this.$toasted.global.success(this.$t('caseFile.financialAssistance.toast.paymentLineDeleted'));
        }
      } else {
        event.group.lines = event.group.lines.filter((l) => l !== event.line);
        if (!event.group.lines.length) {
          this.financialAssistance.groups = this.financialAssistance.groups.filter((g) => g !== event.group);
        }
      }
      await this.submitPaymentNameUpdate();
    },

    async cancelPaymentLine(event : { lineId: string, reason: EPaymentCancellationReason }) {
      const updatedFinancialAssistance = await useFinancialAssistancePaymentStore().cancelFinancialAssistancePaymentLine(this.financialAssistance.id, event.lineId, event.reason);
      if (updatedFinancialAssistance) {
        this.financialAssistance.groups = updatedFinancialAssistance.groups;
      }
    },

    async updatePaymentStatus(event : {
      status: PaymentStatus,
      group: IFinancialAssistancePaymentGroup,
      cancellationReason?: EPaymentCancellationReason,
    }) {
      const updatedFinancialAssistance = await useFinancialAssistancePaymentStore().updatePaymentStatus({
        entityId: this.financialAssistance.id,
        paymentGroupId: event.group.id,
        status: event.status,
        cancellationReason: event.cancellationReason,
      });
      if (updatedFinancialAssistance) {
        this.financialAssistance = new FinancialAssistancePaymentEntity(updatedFinancialAssistance);
        // so we can leave without warning
        (this.$refs.form as VForm).reset();
        this.$toasted.global.success(this.$t('caseFile.financialAssistance.toast.paymentStatusUpdated'));
      }
    },

    makePaymentName(keepDate?:boolean) {
      const programName = this.selectedProgram?.name ? this.$m(this.selectedProgram.name) : '';
      const paymentLineNames = this.makePaymentLineNames();
      const creationTime = this.isEditMode || keepDate ? this.financialAssistance.name.split('-').pop().trim() : format(new Date(), 'yyyyMMdd HHmmss');

      this.financialAssistance.name = `${programName} - ${paymentLineNames} - ${creationTime}`;
    },

    makePaymentLineNames(): string {
      const paymentLineIds = [] as string[];
      this.financialAssistance.groups.forEach((group) => group.lines.forEach((line) => {
        if (line.status === Status.Active) {
          paymentLineIds.push(line.mainCategoryId);
        }
      }));
      const uniquePaymentLineIds = [...new Set(paymentLineIds)];

      return uniquePaymentLineIds.map((id) => {
        const paymentLineData = this.items.find((i) => i.mainCategory.id === id);
        return paymentLineData ? this.$m(paymentLineData.mainCategory.name) : '';
      }).join(' - ');
    },

    async submitPaymentNameUpdate() {
      const originalName = this.financialAssistance.name;
      this.makePaymentName(true);
      if (originalName !== this.financialAssistance.name && this.financialAssistance.id) {
        const result = await useFinancialAssistancePaymentStore().editFinancialAssistancePayment(this.financialAssistance);
        if (result) {
          this.$toasted.global.success(this.$t('financialAssistancePayment_edit.success'));
        }
      }
    },

    async fetchAssessmentFormByProgramId(programId: string) {
      this.programAssessmentForms = [];
      this.programAssessmentForms = await useAssessmentFormStore().fetchByProgramId(programId);
    },

    async fetchAssessmentResponseByCaseFileId(caseFileId: string) {
      const caseFileFilter = {
        'Entity/Association/Id': { value: caseFileId, type: EFilterKeyType.Guid },
        'Entity/Association/Type': helper.getEnumKeyText(AssociationType, AssociationType.CaseFile),
      };

      const res = await useAssessmentResponseStore().search({ params: {
        filter: caseFileFilter,
        top: 999,
      },
      includeInactiveItems: true });

      this.caseFileAssessmentResponses = useAssessmentResponseStore().getByIds(res?.ids);
    },

    async confirmBeforeLeavingWithoutSubmittingPayment(next: NavigationGuardNext = null, approvalStatus: ApprovalStatus) {
      let leavingWithoutSummitedPayment = true;
      if (approvalStatus === ApprovalStatus.New) {
        leavingWithoutSummitedPayment = await this.$confirm({
          title: this.$t('confirmLeaveDialog.title'),
          messages: [
            this.$t('confirmLeaveDialog.paymentUnSubmitted'),
          ],
        });
      }
      if (next && leavingWithoutSummitedPayment) {
        next();
      }
      return leavingWithoutSummitedPayment;
    },
  },
});
</script>
