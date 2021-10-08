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

        <span v-if="transactionApprovalStatus !== ApprovalStatus.New">
          <status-select
            data-test="paymentLineGroup__status"
            :value="paymentGroup.paymentStatus"
            :statuses="paymentStatusesByModality"
            :disabled="paymentStatusesByModality.length < 2"
            status-name="FinancialAssistancePaymentStatus"
            @input="onPaymentStatusChange($event)" />
        </span>
        <span
          v-else
          data-test="paymentLineGroup__paymentMustBeSubmitted">
          <v-icon small class="mt-n1" color="red">
            mdi-alert-outline
          </v-icon>
          {{ $t('financialAssistancePayment.paymentMustBeSubmitted') }}
        </span>
      </span>
    </div>

    <payment-line-item
      v-for="(line, $index) in activeLines"
      :key="$index"
      :payment-line="line"
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

    <!--
      ToDo: Validate before action on edit/delete
      <confirm-before-action
      v-if="showConfirmChangeStatusDialog"
      :title="$t('caseFile.financialAssistance.changeStatusDialog.title')"
      :messages="$t('caseFile.financialAssistance.changeStatusDialog.message', { status: $t(`enums.paymentStatus.${newStatus}`) })"
      :show.sync="showConfirmChangeStatusDialog"
      cancel-button-key="common.cancel"
      submit-button-key="common.confirm"
      :loading="loading"
      data-test="paymentGroup__confirmStatusChangeDialog"
      @submit="onConfirmChangeStatus" />

    <validation-observer ref="form" v-slot="{ failed }" slim>
      <confirm-before-action
        v-if="showCancelPaymentDialog"
        :title="$t('caseFile.financialAssistance.cancelPaymentDialog.title')"
        :show.sync="showCancelPaymentDialog"
        :loading="loading"
        :submit-button-disabled="failed"
        cancel-button-key="common.cancel"
        submit-button-key="caseFile.financialAssistance.cancelPaymentDialog.button"
        data-test="paymentGroup__cancelPaymentDialog"
        @submit="onConfirmCancelPayment">
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
      </confirm-before-action>
    </validation-observer> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import StatusSelect from '@/ui/shared-components/StatusSelect.vue';
import { EPaymentModalities, IProgramEntity } from '@/entities/program';
import {
  IFinancialAssistancePaymentLine,
  PaymentStatus,
  EPaymentCancellationReason,
  IFinancialAssistancePaymentGroup,
  ApprovalStatus,
  FinancialAssistancePaymentGroup,
} from '@/entities/financial-assistance-payment';
import { IFinancialAssistanceTableItem } from '@/entities/financial-assistance';
import PaymentLineItem from './PaymentLineItem.vue';
import { Status } from '@/entities/base';

export default Vue.extend({
  name: 'PaymentLineGroup',

  components: {
    StatusSelect,
    PaymentLineItem,
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
    };
  },

  computed: {
    title(): string | TranslateResult {
      return FinancialAssistancePaymentGroup.groupTitle(this.paymentGroup);
    },

    activeLines(): IFinancialAssistancePaymentLine[] {
      return (this.paymentGroup.lines || []).filter((l) => l.status === Status.Active);
    },

    total(): number {
      return FinancialAssistancePaymentGroup.total([this.paymentGroup]);
    },

    modality(): string {
      const label = this.$t(
        `event.programManagement.paymentModalities.${EPaymentModalities[this.paymentGroup.groupingInformation.modality]}`,
      ) as string;

      // in lowercase so that it continues from Total...
      return label.toLowerCase();
    },

    isCancelled(): boolean {
      return this.paymentGroup.paymentStatus === PaymentStatus.Cancelled;
    },

    isInactive(): boolean {
      if (this.transactionApprovalStatus === ApprovalStatus.New && this.program
        && this.program.paymentModalities.indexOf(this.paymentGroup.groupingInformation.modality) === -1) return true;
      return false;
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
      const isFinance = this.$hasRole('contributorFinance');
      const isLevel1Plus = this.$hasLevel('level1');
      const isLevel3Plus = this.$hasLevel('level3');
      const isLevel6 = this.$hasLevel('level6');

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
      if (statusArr.indexOf(currentStatus) === -1) statusArr = [currentStatus, ...statusArr];

      return statusArr.filter((s) => s);
    },
  },

  created() {
    if (this.isInactive) {
      this.$message({
        title: this.$t('caseFile.financialAssistance.inactiveDetails.title'),
        message: this.$t('caseFile.financialAssistance.inactiveDetails.message'),
      });
    }
  },

  methods: {
    async onPaymentStatusChange(status: PaymentStatus) {
      if (status !== PaymentStatus.Cancelled || await this.$confirm('confirm cancelled...', 'future story...')) {
        this.$emit('update-payment-status', { status, group: this.paymentGroup });
      }
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
}

.paymentGroup__total {
  border-top: 1px solid var(--v-grey-lighten2);
  text-align: right;
  padding: 16px 80px 16px 0px;
}
</style>
