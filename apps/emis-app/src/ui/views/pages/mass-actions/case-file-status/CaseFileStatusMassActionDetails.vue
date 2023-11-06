<!-- do not review, component not finished -->

<template>
  <mass-action-base-details
    :back-route-name="routes.massActions.caseFileStatus.home.name"
    details-title="massAction.caseFileStatus.status.details.title"
    processing-title="massAction.caseFileStatus.status.processing.title"
    pre-processing-title="massAction.caseFileStatus.status.preprocessing.title"
    :can-access-event="canAccessEvent">
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
import { EEventStatus } from '@libs/entities-lib/event';
import { UserRoles } from '@libs/entities-lib/user';
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
      canAccessEvent: false,
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

  async created() {
    // This wont be needed when the httpClient will allow custom catching of 403 errors from the back-end.
    // We wont need to do the check in the front end before trying to process a mass action. The back-end will return 403 if the user has no access to the event,
    // which can be caught by the front-end component and displayed as an error toast notification.
    const eventData = await this.$services.events.searchMyEventsById([this.massAction.details.eventId]);
    this.canAccessEvent = !!eventData?.value?.[0] && (eventData?.value?.[0].entity?.schedule?.status === EEventStatus.Open || this.$hasLevel(UserRoles.level6));
  },

});
</script>
