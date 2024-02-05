<template>
  <div class="paymentGroup">
    <div class="paymentGroup__header flex-row justify-space-between">
      <span class="rc-heading-5" data-test="paymentLineGroup__title" :class="{ 'error--text': isInactive }">
        {{ title }}
      </span>

      <span class="rc-body14">
        <span class="mr-2">
          {{ $t('common.status') }}:
        </span>

        <v-icon
          v-if="paymentGroup.paymentStatusHistory"
          data-test="paymentLineGroup__historyLink"
          :aria-label="$t('caseFile.financialAssistance.approvalHistory')"
          class="mr-2"
          @click="showPaymentStatusHistoryDialog()">
          mdi-history
        </v-icon>

        <span v-if="transactionApprovalStatus === ApprovalStatus.Approved">
          <status-select
            data-test="paymentLineGroup__status"
            :value="paymentGroup.paymentStatus"
            :statuses="paymentStatusesByModality"
            :disabled="readonly || paymentStatusesByModality.length < 2"
            status-name="FinancialAssistancePaymentStatus"
            :attach="false"
            @input="onPaymentStatusChange($event)" />
        </span>
        <span
          v-else
          data-test="paymentLineGroup__statusMessage">
          <v-icon small class="mt-n1" color="red">
            mdi-alert-outline
          </v-icon>
          {{ $t(`${statusMessage}`) }}
        </span>
      </span>
    </div>

    <payment-cancelled-by
      v-if="isCancelled"
      :by="paymentGroup.cancellationBy"
      :date="paymentGroup.cancellationDate"
      :reason="paymentGroup.cancellationReason" />

    <payment-line-item
      v-for="(line, $index) in activeLines"
      :key="$index"
      :payment-line="line"
      :readonly="readonly"
      :transaction-approval-status="transactionApprovalStatus"
      :payment-group="paymentGroup"
      :is-group-cancelled="isCancelled"
      :is-completed="isCompleted"
      :disable-delete-button="disableDeleteButton"
      :disable-cancel-button="disableCancelButton"
      :items="items"
      @edit-payment-line="$emit('edit-payment-line', $event)"
      @cancel-payment-line="$emit('cancel-payment-line', $event)"
      @delete-payment-line="$emit('delete-payment-line', $event)" />

    <div v-if="!isCancelled" class="paymentGroup__total rc-body14 fw-bold" data-test="paymentLineGroup__total">
      {{ $t('caseFile.financialAssistance.groupTotal', { total: $formatCurrency(total), modality }) }}
    </div>

    <payment-status-history-dialog
      v-if="showPaymentStatusHistory"
      :payment-group="paymentGroup"
      :show.sync="showPaymentStatusHistory" />

    <payment-cancellation-reason
      v-if="showCancelConfirmationReason"
      @cancel-with-reason="onConfirmCancel"
      @close="showCancelConfirmationReason = false" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import StatusSelect from '@/ui/shared-components/StatusSelect.vue';
import { EPaymentModalities, IProgramEntity } from '@libs/entities-lib/program';
import {
  ApprovalStatus,
  EPaymentCancellationReason,
  FinancialAssistancePaymentGroup,
  FinancialAssistancePaymentLine,
  IFinancialAssistancePaymentGroup,
  IFinancialAssistancePaymentLine,
  PayeeType,
  PaymentStatus,
} from '@libs/entities-lib/financial-assistance-payment';
import { IFinancialAssistanceTableItem } from '@libs/entities-lib/financial-assistance';
import helpers from '@/ui/helpers/helpers';
import { Status } from '@libs/entities-lib/base';
import { UserRoles } from '@libs/entities-lib/user';
import PaymentStatusHistoryDialog from '@/ui/views/pages/case-files/details/case-file-financial-assistance/components/PaymentStatusHistoryDialog.vue';
import { useUserAccountMetadataStore, useUserAccountStore } from '@/pinia/user-account/user-account';
import { GlobalHandler } from '@libs/services-lib/http-client';
import PaymentLineItem from './PaymentLineItem.vue';
import PaymentCancellationReason from './PaymentCancellationReason.vue';
import PaymentCancelledBy from './PaymentCancelledBy.vue';

export default Vue.extend({
  name: 'PaymentLineGroup',

  components: {
    StatusSelect,
    PaymentLineItem,
    PaymentStatusHistoryDialog,
    PaymentCancelledBy,
    PaymentCancellationReason,
  },

  props: {
    paymentGroup: {
      type: Object as () => IFinancialAssistancePaymentGroup,
      required: true,
    },

    transactionApprovalStatus: {
      type: Number,
      default: null,
    },

    disableDeleteButton: {
      type: Boolean,
      default: false,
    },

    readonly: {
      type: Boolean,
      required: true,
    },

    items: {
      type: Array as () => IFinancialAssistanceTableItem[],
      required: true,
    },

    program: {
      type: Object as () => IProgramEntity,
      default: null,
    },
  },

  data() {
    return {
      loading: false,
      cancellationReason: null as EPaymentCancellationReason,
      ApprovalStatus,
      showCancelConfirmationReason: false,
      showPaymentStatusHistory: false,
      FinancialAssistancePaymentLine,
      cancellationReasons: helpers.enumToTranslatedCollection(EPaymentCancellationReason, 'enums.paymentCancellationReason'),
    };
  },

  computed: {
    title(): string | TranslateResult {
      let key;
      if (FinancialAssistancePaymentGroup.showPayee(this.paymentGroup)) {
        const modality = this.$t(`enums.PaymentModality.${EPaymentModalities[this.paymentGroup.groupingInformation.modality]}`);
        const payeeType = this.$t(`enums.payeeType.new.${PayeeType[this.paymentGroup.groupingInformation.payeeType]}`);
        key = `${modality} (${payeeType}) - ${this.paymentGroup.groupingInformation.payeeName}`;
      } else {
        key = this.$t(`enums.PaymentModality.${EPaymentModalities[this.paymentGroup.groupingInformation.modality]}`);
      }
      return this.$t(`${key}`);
    },

    activeLines(): IFinancialAssistancePaymentLine[] {
      return (this.paymentGroup.lines || []).filter((l) => l.status === Status.Active);
    },

    total(): number {
      return FinancialAssistancePaymentGroup.total([this.paymentGroup]);
    },

    modality(): string {
      const label = this.$t(
        `enums.PaymentModality.${EPaymentModalities[this.paymentGroup.groupingInformation.modality]}`,
      ) as string;

      // in lowercase so that it continues from Total...
      return label.toLowerCase();
    },

    isCancelled(): boolean {
      return this.paymentGroup.paymentStatus === PaymentStatus.Cancelled;
    },

    isCompleted(): boolean {
      return this.paymentGroup.paymentStatus === PaymentStatus.Completed;
    },

    cancellationByText(): TranslateResult {
      return this.$t(
        'caseFile.financialAssistance.cancellationReason.byOn',
        {
          by: useUserAccountMetadataStore().getById(this.paymentGroup.cancellationBy)?.displayName,
          on: helpers.getLocalStringDate(this.paymentGroup.cancellationDate, 'IFinancialAssistancePaymentGroup.cancellationDate', 'PP'),
        },
      );
    },

    cancellationReasonText(): string {
      const text = this.cancellationReasons.filter((a) => a.value === this.paymentGroup.cancellationReason)[0]?.text;
      return text ? `${this.$t('caseFile.financialAssistance.cancellationReason.reason')} ${text}` : null;
    },

    isInactive(): boolean {
      if (this.transactionApprovalStatus === ApprovalStatus.New && this.program
        && this.program.paymentModalities.indexOf(this.paymentGroup.groupingInformation.modality) === -1) {
        return true;
      }
      return false;
    },

    statusMessage():string {
      switch (this.transactionApprovalStatus) {
        case ApprovalStatus.New:
          return 'financialAssistancePayment.paymentMustBeSubmitted';
        case ApprovalStatus.Pending:
          return 'financialAssistancePayment.paymentMustBeApproved';
        case ApprovalStatus.Declined:
          return 'financialAssistancePayment.paymentWasDeclined';
        default:
          return '-';
      }
    },

    disableCancelButton(): boolean {
      return this.paymentGroup.lines.filter((l) => !l.isCancelled).length < 2;
    },

    // eslint-disable-next-line complexity
    paymentStatusesByModality(): Array<PaymentStatus> {
      /*
        based on the excel grid of statuses available according to your role and current modality
        see https://rctech.atlassian.net/browse/EMISV2-673
      */
      let statusArr: Array<PaymentStatus> = [];
      const currentModality = this.paymentGroup.groupingInformation.modality;
      const currentStatus = this.paymentGroup.paymentStatus;
      const isFinance = this.$hasRole(UserRoles.contributorFinance);
      const isLevel1Plus = this.$hasLevel(UserRoles.level1);
      const isLevel3Plus = this.$hasLevel(UserRoles.level3);
      const isLevel6 = this.$hasLevel(UserRoles.level6);

      if (!isFinance && !isLevel1Plus) {
        return [currentStatus];
      }

      switch (currentModality) {
        case EPaymentModalities.ETransfer:
          if (isFinance || isLevel6) {
            statusArr = [
              PaymentStatus.New,
              currentStatus !== PaymentStatus.New ? PaymentStatus.InProgress : null,
              PaymentStatus.Sent,
              PaymentStatus.Completed,
              PaymentStatus.Cancelled,
            ];
          } else if (isLevel3Plus && currentStatus === PaymentStatus.New) {
            statusArr = [PaymentStatus.Cancelled];
          }
          break;

        case EPaymentModalities.Cheque:
        case EPaymentModalities.DirectDeposit:
          if (isFinance || isLevel6) {
            statusArr = [
              PaymentStatus.New,
              currentStatus !== PaymentStatus.New || currentModality === EPaymentModalities.DirectDeposit ? PaymentStatus.InProgress : null,
              PaymentStatus.Completed,
              PaymentStatus.Cancelled,
            ];
          } else if (isLevel3Plus && currentStatus === PaymentStatus.New) {
            statusArr = [PaymentStatus.Cancelled];
          }
          break;

        case EPaymentModalities.Voucher:
        case EPaymentModalities.Invoice:
          if (isFinance || isLevel6) {
            statusArr = [
              PaymentStatus.Issued,
              PaymentStatus.Completed,
              PaymentStatus.Cancelled,
            ];
          } else if (isLevel3Plus && currentStatus === PaymentStatus.Issued) {
            statusArr = [PaymentStatus.Cancelled];
          }
          break;

        case EPaymentModalities.PrepaidCard:
          if (isFinance || isLevel6) {
            statusArr = [
              PaymentStatus.New,
              PaymentStatus.Completed,
              PaymentStatus.Cancelled,
            ];
          } else if (isLevel3Plus && currentStatus === PaymentStatus.New) {
            statusArr = [PaymentStatus.Completed, PaymentStatus.Cancelled];
          } else if (isLevel1Plus && currentStatus === PaymentStatus.New) {
            statusArr = [PaymentStatus.Completed];
          }
          break;

        case EPaymentModalities.GiftCard:
          if (isFinance || isLevel6) {
            statusArr = [
              PaymentStatus.Issued,
              PaymentStatus.Cancelled,
            ];
          } else if (isLevel3Plus && currentStatus === PaymentStatus.Issued) {
            statusArr = [PaymentStatus.Cancelled];
          }
          break;

        default:
          statusArr = [];
      }
      if (statusArr.indexOf(currentStatus) === -1) {
        statusArr = [currentStatus, ...statusArr];
      }

      return statusArr.filter((s) => s);
    },
  },

  async created() {
    if (this.isInactive) {
      this.$message({
        title: this.$t('caseFile.financialAssistance.inactiveDetails.title'),
        message: this.$t('caseFile.financialAssistance.inactiveDetails.message'),
      });
    }

    if (this.paymentGroup.cancellationBy) {
      await useUserAccountStore().fetch(this.paymentGroup.cancellationBy);
      await useUserAccountMetadataStore().fetch(this.paymentGroup.cancellationBy, GlobalHandler.Partial);
    }
  },

  methods: {
    async onPaymentStatusChange(status: PaymentStatus) {
      if (status !== PaymentStatus.Cancelled) {
        this.$emit('update-payment-status', { status, group: this.paymentGroup });
        return;
      }

      if (this.paymentGroup.groupingInformation.modality !== EPaymentModalities.ETransfer) {
        const userChoice = await this.$confirm({
          title: this.$t('caseFile.financialAssistance.cancelPaymentGroup.confirm.title'),
          messages: this.$t('caseFile.financialAssistance.cancelPaymentGroup.confirm.message', { modality: this.modality.toLowerCase() }),
        });

        if (userChoice) {
          this.$emit('update-payment-status', { status, group: this.paymentGroup });
        }
      } else {
        this.cancellationReason = null;
        this.showCancelConfirmationReason = true;
      }
    },

    onConfirmCancel(cancellationReason: EPaymentCancellationReason) {
      this.showCancelConfirmationReason = false;
      this.$emit('update-payment-status', { status: PaymentStatus.Cancelled, group: this.paymentGroup, cancellationReason });
    },

    showPaymentStatusHistoryDialog() {
      this.showPaymentStatusHistory = true;
    },
  },
});
</script>

<style scoped lang="scss">
.paymentGroup__header {
  border-top: 1px solid var(--v-grey-lighten2);
  background-color: var(--v-grey-lighten5);
  min-height: 55px;
  padding: 12px 16px;
  flex-wrap: wrap;
}

.paymentGroup:first-child .paymentGroup__header {
  border-top: none;
}

.cancellationReason {
  padding: 4px 16px;
  background: var(--v-status_red_pale-base);
  display: flex;
}

.paymentGroup__total {
  border-top: 1px solid var(--v-grey-lighten2);
  text-align: right;
  padding: 16px 80px 16px 0px;
}
</style>
