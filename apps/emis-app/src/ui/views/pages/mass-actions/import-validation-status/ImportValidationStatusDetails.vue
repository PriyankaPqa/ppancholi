<template>
  <mass-action-base-details
    pre-processing-title="massActions.impactValidation.status.preprocessing.title"
    processing-title="massActions.impactValidation.status.processing.title"
    details-title="massActions.impactValidation.status.details.title"
    :back-route-name="routes.massActions.importValidationStatus.home.name" />
</template>

<script lang="ts">
import Vue from 'vue';
import routes from '@/constants/routes';
import MassActionBaseDetails from '@/ui/views/pages/mass-actions/components/MassActionBaseDetails.vue';

export default Vue.extend({
  name: 'ImportValidationStatusDetails',

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
