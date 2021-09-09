<template>
  <mass-action-pre-processing-base
    :mass-action="massAction"
    mass-action-type="massActions.type.financialAssistance">
    <financial-assistance-payment-details-table :mass-action="massAction" />
  </mass-action-pre-processing-base>
</template>

<script lang="ts">
import Vue from 'vue';
import MassActionPreProcessingBase from '@/ui/views/pages/mass-actions/components/MassActionPreProcessingBase.vue';
import FinancialAssistancePaymentDetailsTable from '@/ui/views/pages/mass-actions/financial-assistance/FinancialAssistancePaymentDetailsTable.vue';
import { IMassActionCombined } from '@/entities/mass-action';

export default Vue.extend({
  name: 'FinancialAssistancePreProcessing',
  components: {
    FinancialAssistancePaymentDetailsTable,
    MassActionPreProcessingBase,
  },
  props: {
    massAction: {
      type: Object as () => IMassActionCombined,
      required: true,
    },
  },
});
</script>
