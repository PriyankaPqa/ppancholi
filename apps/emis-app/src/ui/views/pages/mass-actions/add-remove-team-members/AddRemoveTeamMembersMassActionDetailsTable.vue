<template>
  <div>
    <v-row no-gutters class="row-data">
      <v-col cols="12" md="5">
        <span class="rc-body14 fw-bold">{{ $t('team_stats.team.select.label') }}</span>
      </v-col>
      <v-col md="7">
        <span v-if="!teamLoading && team" class="'rc-body14'" data-test="mass-action-add-remove-team-members-details-team-name">
          {{ team.name }}
        </span>
        <v-progress-circular v-else indeterminate color="primary" />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { IMassActionAddRemoveTeamMembersDetails, IMassActionEntity } from '@libs/entities-lib/mass-action';
import { ITeamEntity } from '@libs/entities-lib/team';
import { useTeamStore } from '@/pinia/team/team';

export default Vue.extend({
  name: 'AddRemoveTeamMembersMassActionDetailsTable',

  props: {
    massAction: {
      type: Object as () => IMassActionEntity,
      required: true,
    },
  },

  data() {
    return {
      team: null as ITeamEntity,
      teamLoading: false,
    };
  },

  async created() {
    await this.fetchTeam();
  },

  methods: {
    async fetchTeam() {
      this.teamLoading = true;
      const res = await useTeamStore().fetch((this.massAction.details as IMassActionAddRemoveTeamMembersDetails).teamId) as ITeamEntity;
      if (res) {
        this.team = res;
      }
      this.teamLoading = false;
    },
  },
});
</script>

<style lang="scss" scoped>
.row-data {
  min-height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border: solid var(--v-grey-lighten2);
  border-width: 1px 1px 1px 1px;
  border-radius: 4px;
}
</style>
