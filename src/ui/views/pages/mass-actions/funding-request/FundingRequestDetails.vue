<template>
  <mass-action-base-details
    :mass-action-type="MassActionType.GenerateFundingRequest"
    pre-processing-title="massActions.fundingRequest.status.preprocessing.title"
    processing-title="massActions.fundingRequest.status.processing.title"
    details-title="massActions.fundingRequest.status.details.title"
    :back-route-name="routes.massActions.fundingRequest.home.name" />
</template>

<script lang="ts">
import Vue from 'vue';
import MassActionBaseDetails from '@/ui/views/pages/mass-actions/components/MassActionBaseDetails.vue';
import routes from '@/constants/routes';
import { MassActionType } from '@/entities/mass-action';

export default Vue.extend({
  name: 'FundingRequestDetails',
  components: {
    MassActionBaseDetails,
  },
  data() {
    return {
      routes,
      MassActionType,
    };
  },
});
</script>
