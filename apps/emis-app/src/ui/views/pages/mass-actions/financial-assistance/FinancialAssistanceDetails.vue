<template>
  <mass-action-base-details
    :back-route-name="routes.massActions.financialAssistance.home.name"
    details-title="massActions.financialAssistance.status.details.title"
    processing-title="massActions.financialAssistance.status.processing.title"
    pre-processing-title="massActions.financialAssistance.status.preprocessing.title"
    :mass-action-type="MassActionType.FinancialAssistance">
    <template #pre-processing>
      <financial-assistance-payment-details-table :mass-action="massAction" />
    </template>
    <template #pre-processed>
      <financial-assistance-payment-details-table :mass-action="massAction" />
    </template>
    <template #processed>
      <financial-assistance-payment-details-table :mass-action="massAction" />
    </template>
  </mass-action-base-details>
</template>

<script lang="ts">
import Vue from 'vue';
import FinancialAssistancePaymentDetailsTable from '@/ui/views/pages/mass-actions/financial-assistance/FinancialAssistancePaymentDetailsTable.vue';
import { MassActionType, IMassActionCombined } from '@/entities/mass-action';
import MassActionBaseDetails from '@/ui/views/pages/mass-actions/components/MassActionBaseDetails.vue';
import routes from '@/constants/routes';

export default Vue.extend({
  name: 'FinancialAssistanceDetails',
  components: {
    MassActionBaseDetails,
    FinancialAssistancePaymentDetailsTable,
  },

  data() {
    return {
      MassActionType,
      routes,
    };
  },

  computed: {
    massActionId(): string {
      return this.$route.params.id;
    },

    massAction(): IMassActionCombined {
      return this.$storage.massAction.getters.get(this.massActionId);
    },
  },
});
</script>
