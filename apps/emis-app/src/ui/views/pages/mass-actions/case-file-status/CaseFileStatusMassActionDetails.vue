<!-- do not review, component not finished -->

<template>
  <mass-action-base-details
    :back-route-name="routes.massActions.caseFileStatus.home.name"
    details-title="massAction.caseFileStatus.status.details.title"
    processing-title="massAction.caseFileStatus.status.processing.title"
    pre-processing-title="massAction.caseFileStatus.status.preprocessing.title" />
</template>

<script lang="ts">

import Vue from 'vue';
import routes from '@/constants/routes';
import MassActionBaseDetails from '@/ui/views/pages/mass-actions/components/MassActionBaseDetails.vue';

export default Vue.extend({
  name: 'CaseFileStatusMassActionDetails',
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
