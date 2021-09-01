<template>
  <div class="paymentGroup">
    <div class="paymentGroup__header flex-row justify-space-between">
      <span class="rc-heading-5" data-test="paymentLineGroup__title">
        {{ title }}
      </span>

      <span class="rc-body14">
        <span class="mr-2">
          {{ $t('common.status') }}:
        </span>

        <span>
          <status-chip status-name="FinancialAssistancePaymentStatus" :status="paymentGroup.paymentStatus" />
        </span>
      </span>
    </div>

    <payment-line-item
      v-for="(line, $index) in paymentGroup.lines"
      :key="$index"
      :payment-line="line"
      :transaction-approval-status="transactionApprovalStatus"
      :modality="paymentGroup.groupingInformation.modality"
      :is-cancelled="isCancelled"
      :link="link"
      :disable-delete-button="disableDeleteButton"
      :items="items"
      @edit-payment-line="$emit('edit-payment-line', { line: $event, group: paymentGroup })"
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
// import { VSelectWithValidation } from '@crctech/component-library';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { EPaymentModalities } from '@/entities/program/program.types';
import {
  IFinancialAssistancePaymentLine,
  PayeeType,
  PaymentStatus,
  EPaymentCancellationReason,
  IFinancialAssistancePaymentGroup,
} from '@/entities/financial-assistance-payment';
import { IFinancialAssistanceTableItem } from '@/entities/financial-assistance';
import PaymentLineItem from './PaymentLineItem.vue';

export default Vue.extend({
  name: 'PaymentLineGroup',

  components: {
    // VSelectWithValidation,
    StatusChip,
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

    link: {
      type: Boolean,
      default: false,
    },

    disableDeleteButton: {
      type: Boolean,
      default: false,
    },

    items: {
      type: Array as () => IFinancialAssistanceTableItem[],
      required: true,
    },
  },

  data() {
    return {
      newStatus: PaymentStatus.New,
      showConfirmChangeStatusDialog: false,
      showCancelPaymentDialog: false,
      loading: false,
      cancellationReason: null as EPaymentCancellationReason,
    };
  },

  computed: {
    title(): string | TranslateResult {
      if (this.paymentGroup.groupingInformation.modality === EPaymentModalities.Cheque
        || this.paymentGroup.groupingInformation.modality === EPaymentModalities.DirectDeposit) {
        const modality = this.$t(`event.programManagement.paymentModalities.${EPaymentModalities[this.paymentGroup.groupingInformation.modality]}`);
        const payeeType = this.$t(`enums.payeeType.${PayeeType[this.paymentGroup.groupingInformation.payeeType]}`);

        return `${modality} (${payeeType}) - ${this.paymentGroup.groupingInformation.payeeName}`;
      }

      return this.$t(`event.programManagement.paymentModalities.${EPaymentModalities[this.paymentGroup.groupingInformation.modality]}`);
    },

    total(): number {
      let total = 0;

      this.paymentGroup.lines?.forEach((line: IFinancialAssistancePaymentLine) => {
        total += line.amount;
      });

      return Math.round(total * 100) / 100;
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

    // ToDo: Used to modify the paymentStatus according to the current modality.
    // paymentStatusesByModality(): Array<{key: PaymentStatus; text: string;}> {
    //   let statusArr: Array<PaymentStatus> = [];

    //   switch (this.paymentGroup.modality) {
    //     case EPaymentModalities.ETransfer:
    //       statusArr = [
    //         PaymentStatus.New,
    //         PaymentStatus.InProgress,
    //         PaymentStatus.Sent,
    //         PaymentStatus.Completed,
    //         PaymentStatus.Cancelled,
    //       ];
    //       break;

    //     case EPaymentModalities.Cheque:
    //     case EPaymentModalities.DirectDeposit:
    //       statusArr = [
    //         PaymentStatus.New,
    //         PaymentStatus.InProgress,
    //         PaymentStatus.Completed,
    //         PaymentStatus.Cancelled,
    //       ];
    //       break;

    //     case EPaymentModalities.PrepaidCard:
    //       statusArr = [
    //         PaymentStatus.New,
    //         PaymentStatus.Completed,
    //         PaymentStatus.Cancelled,
    //       ];
    //       break;

    //     case EPaymentModalities.Voucher:
    //       statusArr = [
    //         PaymentStatus.Issued,
    //         PaymentStatus.Completed,
    //         PaymentStatus.Cancelled,
    //       ];
    //       break;

    //     default:
    //       statusArr = [];
    //   }

    //   return statusArr.map((status) => ({
    //     key: status,
    //     text: `enums.paymentStatus.${status}`,
    //   }));
    // },
  },

  methods: {
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
