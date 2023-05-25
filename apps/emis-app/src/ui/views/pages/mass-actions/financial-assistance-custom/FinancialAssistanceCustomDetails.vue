<template>
  <mass-action-base-details
    pre-processing-title="massActions.financialAssistanceCustomCreate.status.preprocessing.title"
    processing-title="massActions.financialAssistanceCustomCreate.status.processing.title"
    details-title="massActions.financialAssistanceCustomCreate.status.details.title"
    :back-route-name="routes.massActions.financialAssistanceCustom.home.name" />
</template>

<script lang="ts">
import Vue from 'vue';
import routes from '@/constants/routes';
import MassActionBaseDetails from '@/ui/views/pages/mass-actions/components/MassActionBaseDetails.vue';

export default Vue.extend({
  name: 'FinancialAssistanceCustomCreateDetails',

  components: {
    MassActionBaseDetails,
  },

  data() {
    return {
      routes,
    };
  },
});
</script>
