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
    <div v-if="isCancelled" class="cancellationReason rc-body12">
      <v-icon small color="red" class="mr-4">
        mdi-alert
      </v-icon>
      <div class="mr-4">
        {{ cancellationByText }}
      </div>
      <div v-if="cancellationReasonText">
        {{ cancellationReasonText }}
      </div>
    </div>

    <payment-line-item
      v-for="(line, $index) in activeLines"
      :key="$index"
      :payment-line="line"
      :readonly="readonly"
      :transaction-approval-status="transactionApprovalStatus"
      :payment-group="paymentGroup"
      :is-cancelled="isCancelled"
      :disable-delete-button="disableDeleteButton"
      :items="items"
      @edit-payment-line="$emit('edit-payment-line', $event)"
      @delete-payment-line="$emit('delete-payment-line', $event)" />

    <div v-if="!isCancelled" class="paymentGroup__total rc-body14 fw-bold" data-test="paymentLineGroup__total">
      {{ $t('caseFile.financialAssistance.groupTotal', { total: $formatCurrency(total), modality }) }}
    </div>

    <rc-confirmation-dialog
      data-test="cancel_confirmation_reason_dialog"
      :show.sync="showCancelConfirmationReason"
      :title="$t('caseFile.financialAssistance.changeStatusDialog.title')"
      :submit-button-disabled="cancellationReason == null"
      submit-button-key="caseFile.financialAssistance.cancelPaymentDialog.button"
      @submit="onConfirmCancel">
      <template #default>
        <div>
          <div class="rc-body16 fw-bold mb-4">
            {{ $t('caseFile.financialAssistance.cancelPaymentDialog.message') }}
          </div>
          <v-select-with-validation
            v-model="cancellationReason"
            data-test="paymentGroup__cancellationReason"
            :items="cancellationReasons"
            rules="required"
            :label="`${$t('caseFile.financialAssistance.cancelPaymentDialog.chooseReason')} *`" />
        </div>
      </template>
    </rc-confirmation-dialog>

    <payment-status-history-dialog
      v-if="showPaymentStatusHistory"
      :payment-group="paymentGroup"
      :show.sync="showPaymentStatusHistory" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { RcConfirmationDialog, VSelectWithValidation } from '@libs/component-lib/components';
import StatusSelect from '@/ui/shared-components/StatusSelect.vue';
import { EPaymentModalities, IProgramEntity } from '@libs/entities-lib/program';
import {
  ApprovalStatus,
  EPaymentCancellationReason,
  FinancialAssistancePaymentGroup,
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
import PaymentLineItem from './PaymentLineItem.vue';

export default Vue.extend({
  name: 'PaymentLineGroup',

  components: {
    StatusSelect,
    PaymentLineItem,
    RcConfirmationDialog,
    VSelectWithValidation,
    PaymentStatusHistoryDialog,
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

    cancellationByText(): TranslateResult {
      return this.$t(
        'caseFile.financialAssistance.cancellationReason.byOn',
        {
          by: useUserAccountMetadataStore().getById(this.paymentGroup.cancellationBy)?.displayName,
          on: helpers.getLocalStringDate(this.paymentGroup.cancellationDate, 'IFinancialAssistancePaymentGroup.cancellationDate', 'MMM d, yyyy'),
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
      await useUserAccountMetadataStore().fetch(this.paymentGroup.cancellationBy, false);
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

    onConfirmCancel() {
      this.showCancelConfirmationReason = false;
      this.$emit('update-payment-status', { status: PaymentStatus.Cancelled, group: this.paymentGroup, cancellationReason: this.cancellationReason });
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
