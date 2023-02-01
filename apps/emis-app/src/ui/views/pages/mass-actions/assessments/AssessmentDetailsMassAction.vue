<template>
  <mass-action-base-details
    :back-route-name="routes.massActions.assessments.home.name"
    details-title="massActions.assessment.status.details.title"
    processing-title="massActions.assessment.status.processing.title"
    pre-processing-title="massActions.assessment.status.preprocessing.title">
    <template #pre-processing>
      <assessment-details-table :mass-action="massAction" />
    </template>
    <template #pre-processed>
      <assessment-details-table :mass-action="massAction" />
    </template>
    <template #processed>
      <assessment-details-table :mass-action="massAction" />
    </template>
  </mass-action-base-details>
</template>

<script lang="ts">
import Vue from 'vue';
import {
 IMassActionEntity,
} from '@libs/entities-lib/mass-action';
import MassActionBaseDetails from '@/ui/views/pages/mass-actions/components/MassActionBaseDetails.vue';
import routes from '@/constants/routes';
import { useMassActionStore } from '@/pinia/mass-action/mass-action';
import AssessmentDetailsTable from './AssessmentDetailsTable.vue';

export default Vue.extend({
  name: 'AssessmentDetails',
  components: {
    MassActionBaseDetails,
    AssessmentDetailsTable,
  },

  data() {
    return {
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
