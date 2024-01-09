<template>
  <mass-action-base-details
    :back-route-name="routes.massActions.communications.home.name"
    details-title="massActions.communication.status.details.title"
    processing-title="massActions.communication.status.processing.title"
    pre-processing-title="massActions.communication.status.preprocessing.title">
    <template #pre-processing>
      <communication-details-table :mass-action="massAction" />
    </template>
    <template #pre-processed>
      <communication-details-table :mass-action="massAction" />
    </template>
    <template #processed>
      <communication-details-table :mass-action="massAction" />
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
import CommunicationDetailsTable from './CommunicationDetailsTable.vue';

export default Vue.extend({
  name: 'CommunicationDetails',
  components: {
    MassActionBaseDetails,
    CommunicationDetailsTable,
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
