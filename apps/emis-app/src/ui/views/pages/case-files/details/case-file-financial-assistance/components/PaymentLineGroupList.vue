<template>
  <div class="paymentGroups__container">
    <payment-line-group
      v-for="(group, $index) in paymentGroups"
      :key="$index"
      :payment-group="group"
      :readonly="readonly"
      :transaction-approval-status="transactionApprovalStatus"
      :link="link"
      :program="program"
      :disable-delete-button="disableDeleteButton"
      :items="items"
      @edit-payment-line="$emit('edit-payment-line', $event)"
      @delete-payment-line="$emit('delete-payment-line', $event)"
      @update-payment-status="$emit('update-payment-status', $event)" />

    <div class="row paymentGroups__total rc-heading-5">
      <v-btn
        v-if="canSubmit"
        :disabled="disableSubmitPayment"
        color="primary"
        data-test="submit"
        class="mr-4"
        @click="$emit('submit-payment', { total: $formatCurrency(total) })">
        {{ $t('caseFile.financialAssistance.submitAssistance') }}
      </v-btn>
      <div>
        {{ $t('caseFile.financialAssistance.transactionTotal', { total: $formatCurrency(total) }) }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  IFinancialAssistancePaymentGroup,
  ApprovalStatus,
  FinancialAssistancePaymentGroup,
} from '@/entities/financial-assistance-payment';
import { IFinancialAssistanceTableItem } from '@/entities/financial-assistance';
import PaymentLineGroup from './PaymentLineGroup.vue';
import { IProgramEntity } from '@/entities/program';

export default Vue.extend({
  name: 'PaymentLineGroupList',

  components: {
    PaymentLineGroup,
  },

  props: {
    paymentGroups: {
      type: Array as () => Array<IFinancialAssistancePaymentGroup>,
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

    readonly: {
      type: Boolean,
      required: true,
    },

    disableDeleteButton: {
      type: Boolean,
      default: false,
    },

    disableSubmitPayment: {
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

  computed: {
    total(): number {
      return FinancialAssistancePaymentGroup.total(this.paymentGroups);
    },

    canSubmit(): boolean {
      return !this.readonly && this.$hasLevel('level1') && this.transactionApprovalStatus === ApprovalStatus.New;
    },
  },
});
</script>

<style scoped lang="scss">
.paymentGroups__container {
  border: 1px solid var(--v-grey-lighten2);
  border-radius: 4px;
  overflow: hidden;
}

.paymentGroups__total {
  border-top: 1px solid var(--v-grey-lighten2);
  padding: 16px 80px 16px 16px;
  margin: 0;
}

.paymentGroups__total > :last-child {
  margin-left: auto;
}
</style>
