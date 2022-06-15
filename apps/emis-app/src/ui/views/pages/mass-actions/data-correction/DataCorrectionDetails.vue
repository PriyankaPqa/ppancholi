<template>
  <mass-action-base-details
    pre-processing-title="massActions.dataCorrection.status.preprocessing.title"
    processing-title="massActions.dataCorrection.status.processing.title"
    details-title="massActions.dataCorrection.status.details.title"
    :back-route-name="routes.massActions.dataCorrection.home.name" />
</template>

<script lang="ts">
import Vue from 'vue';
import routes from '@/constants/routes';
import MassActionBaseDetails from '@/ui/views/pages/mass-actions/components/MassActionBaseDetails.vue';

export default Vue.extend({
  name: 'DataCorrectionDetails',
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
