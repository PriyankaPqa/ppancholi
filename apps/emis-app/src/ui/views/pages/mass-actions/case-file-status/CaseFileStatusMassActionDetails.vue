<!-- do not review, component not finished -->

<template>
  <mass-action-base-details
    :back-route-name="routes.massActions.caseFileStatus.home.name"
    details-title="massAction.caseFileStatus.status.details.title"
    processing-title="massAction.caseFileStatus.status.processing.title"
    pre-processing-title="massAction.caseFileStatus.status.preprocessing.title">
    <template #pre-processing>
      <case-file-status-mass-action-details-table :mass-action="massAction" />
    </template>
    <template #pre-processed>
      <case-file-status-mass-action-details-table :mass-action="massAction" />
    </template>
    <template #processed>
      <case-file-status-mass-action-details-table :mass-action="massAction" />
    </template>
  </mass-action-base-details>
</template>

<script lang="ts">

import Vue from 'vue';
import routes from '@/constants/routes';
import { useMassActionStore } from '@/pinia/mass-action/mass-action';
import MassActionBaseDetails from '@/ui/views/pages/mass-actions/components/MassActionBaseDetails.vue';
import { IMassActionEntity } from '@libs/entities-lib/mass-action';
import CaseFileStatusMassActionDetailsTable from './CaseFileStatusMassActionDetailsTable.vue';

export default Vue.extend({
  name: 'CaseFileStatusMassActionDetails',
  components: {
    MassActionBaseDetails,
    CaseFileStatusMassActionDetailsTable,
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
