<template>
  <mass-action-base-details
    :mass-action-type="MassActionType.ImportValidationOfImpactStatus"
    pre-processing-title="massActions.impactValidation.status.preprocessing.title"
    processing-title="massActions.impactValidation.status.processing.title"
    details-title="massActions.impactValidation.status.details.title"
    :back-route-name="routes.massActions.importValidationStatus.home.name" />
</template>

<script lang="ts">
import Vue from 'vue';
import routes from '@/constants/routes';
import MassActionBaseDetails from '@/ui/views/pages/mass-actions/components/MassActionBaseDetails.vue';
import { MassActionType } from '@/entities/mass-action';

export default Vue.extend({
  name: 'ImportValidationStatusDetails',

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
