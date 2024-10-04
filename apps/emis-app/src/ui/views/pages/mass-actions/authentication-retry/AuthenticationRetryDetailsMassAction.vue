<template>
  <mass-action-base-details
    :back-route-name="routes.massActions.authenticationRetry.home.name"
    details-title="massActions.authenticationRetry.status.details.title"
    processing-title="massActions.authenticationRetry.status.processing.title"
    pre-processing-title="massActions.authenticationRetry.status.preprocessing.title">
    <template #pre-processing>
      <authentication-retry-details-table :mass-action="massAction" />
    </template>
    <template #pre-processed>
      <authentication-retry-details-table :mass-action="massAction" />
    </template>
    <template #processed>
      <authentication-retry-details-table :mass-action="massAction" />
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
import AuthenticationRetryDetailsTable from './AuthenticationRetryDetailsTable.vue';

export default Vue.extend({
  name: 'AuthenticationRetryDetails',
  components: {
    MassActionBaseDetails,
    AuthenticationRetryDetailsTable,
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
