<template>
  <mass-action-base-details
    :disable-name="$hasFeature(FeatureKeys.MassActionAutoGenerateName)"
    :back-route-name="routes.massActions.financialAssistance.home.name"
    details-title="massActions.financialAssistance.status.details.title"
    processing-title="massActions.financialAssistance.status.processing.title"
    pre-processing-title="massActions.financialAssistance.status.preprocessing.title">
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
import {
 IMassActionEntity,
} from '@libs/entities-lib/mass-action';
import MassActionBaseDetails from '@/ui/views/pages/mass-actions/components/MassActionBaseDetails.vue';
import routes from '@/constants/routes';
import { useMassActionStore } from '@/pinia/mass-action/mass-action';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';

export default Vue.extend({
  name: 'FinancialAssistanceDetails',
  components: {
    MassActionBaseDetails,
    FinancialAssistancePaymentDetailsTable,
  },

  data() {
    return {
      FeatureKeys,
      routes,
    };
  },

  computed: {
    massActionId(): string {
      return this.$route.params.id;
    },

    massAction(): IMassActionEntity {
      return useMassActionStore().getById(this.massActionId);
    },
  },
});
</script>
