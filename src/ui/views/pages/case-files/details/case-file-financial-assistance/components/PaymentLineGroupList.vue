<template>
  <div class="paymentGroups__container">
    <payment-line-group
      v-for="(group, $index) in paymentGroups"
      :key="$index"
      :payment-group="group"
      :transaction-approval-status="transactionApprovalStatus"
      :link="link"
      :disable-delete-button="disableDeleteButton"
      :items="items"
      @edit-payment-line="$emit('edit-payment-line', $event)"
      @delete-payment-line="$emit('delete-payment-line', $event)"
      @update-payment-status="$emit('update-payment-status')" />

    <div class="row paymentGroups__total rc-heading-5">
      <v-btn v-if="canSubmit" color="primary" data-test="submit" class="mr-4" @click="$emit('submit-payment', { total: $formatCurrency(total) })">
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
  PaymentStatus,
  IFinancialAssistancePaymentGroup,
  IFinancialAssistancePaymentLine,
  ApprovalStatus,
} from '@/entities/financial-assistance-payment';
import { IFinancialAssistanceTableItem } from '@/entities/financial-assistance';
import PaymentLineGroup from './PaymentLineGroup.vue';
import { Status } from '@/entities/base';

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

    disableDeleteButton: {
      type: Boolean,
      default: false,
    },

    items: {
      type: Array as () => IFinancialAssistanceTableItem[],
      required: true,
    },
  },

  computed: {
    total(): number {
      let total = 0;

      this.paymentGroups.forEach((group: IFinancialAssistancePaymentGroup) => {
        if (group.paymentStatus !== PaymentStatus.Cancelled) {
          group.lines?.forEach((line: IFinancialAssistancePaymentLine) => {
            if (line.status === Status.Active) total += line.amount;
          });
        }
      });

      return Math.round(total * 100) / 100;
    },

    canSubmit(): boolean {
      return this.$hasLevel('level1') && this.transactionApprovalStatus === ApprovalStatus.New;
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
