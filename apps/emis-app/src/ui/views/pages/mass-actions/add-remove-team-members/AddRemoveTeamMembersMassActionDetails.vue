<template>
  <mass-action-base-details
    :back-route-name="routes.massActions.addRemoveTeamMembers.home.name"
    :details-title="title"
    :processing-title="processingTitle"
    :pre-processing-title="preProcessingTitle">
    <template #pre-processing>
      <add-remove-team-members-mass-action-details-table :mass-action="massAction" />
    </template>
    <template #pre-processed>
      <add-remove-team-members-mass-action-details-table :mass-action="massAction" />
    </template>
    <template #processed>
      <add-remove-team-members-mass-action-details-table :mass-action="massAction" />
    </template>
  </mass-action-base-details>
</template>

<script lang="ts">

import Vue from 'vue';
import routes from '@/constants/routes';
import { useMassActionStore } from '@/pinia/mass-action/mass-action';
import MassActionBaseDetails from '@/ui/views/pages/mass-actions/components/MassActionBaseDetails.vue';
import { IMassActionAddRemoveTeamMembersDetails, IMassActionEntity, TeamMembersMassActionType } from '@libs/entities-lib/mass-action';
import AddRemoveTeamMembersMassActionDetailsTable from './AddRemoveTeamMembersMassActionDetailsTable.vue';

export default Vue.extend({
  name: 'AddRemoveTeamMembersMassActionDetails',
  components: {
    MassActionBaseDetails,
    AddRemoveTeamMembersMassActionDetailsTable,
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

    isAddMembers(): boolean {
      return (this.massAction.details as IMassActionAddRemoveTeamMembersDetails)?.teamMembersMassActionType === TeamMembersMassActionType.AddTeamMember;
    },

    title(): string {
      return this.isAddMembers
        ? this.$t('massAction.addRemoveTeamMembers.create.title.add') as string
        : this.$t('massAction.addRemoveTeamMembers.create.title.remove') as string;
    },

    processingTitle(): string {
      return this.isAddMembers
        ? this.$t('massAction.addRemoveTeamMembers.status.processing.title.add') as string
        : this.$t('massAction.addRemoveTeamMembers.status.processing.title.remove') as string;
    },

    preProcessingTitle(): string {
      return this.isAddMembers
        ? this.$t('massAction.addRemoveTeamMembers.status.preprocessing.title.add') as string
        : this.$t('massAction.addRemoveTeamMembers.status.preprocessing.title.remove') as string;
    },
  },
});
</script>
