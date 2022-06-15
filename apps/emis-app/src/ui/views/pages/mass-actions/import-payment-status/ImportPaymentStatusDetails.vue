<template>
  <mass-action-base-details
    pre-processing-title="massActions.importPaymentStatus.status.preprocessing.title"
    processing-title="massActions.importPaymentStatus.status.processing.title"
    details-title="massActions.importPaymentStatus.status.details.title"
    :back-route-name="routes.massActions.importPaymentStatus.home.name" />
</template>

<script lang="ts">
import Vue from 'vue';
import routes from '@/constants/routes';
import MassActionBaseDetails from '@/ui/views/pages/mass-actions/components/MassActionBaseDetails.vue';

export default Vue.extend({
  name: 'ImportPaymentStatusDetails',

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
