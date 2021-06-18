<template>
  <rc-dialog
    v-if="show"
    :title="member.displayName"
    :show="show"
    content-only-scrolling
    content-padding="0"
    :persistent="true"
    :max-width="750"
    :min-height="530"
    :show-cancel="false"
    :show-submit="false"
    @close="$emit('update:show', false)">
    <v-progress-circular v-if="isLoading" style="margin: auto" indeterminate color="primary" />

    <v-simple-table v-else class="member_teams_table">
      <thead>
        <tr>
          <th class="text-left" style="min-width: 100px">
            {{ $t('teams.teams') }}
          </th>
          <th class="text-left" style="min-width: 100px">
            {{ $t('teams.teamtype') }}
          </th>
          <th class="text-left">
            {{ $t('teams.table.related_events') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(team, index) in teams"
          :key="index">
          <td data-test="team_name">
            {{ team.teamName }}
          </td>
          <td data-test="team_type">
            {{ $m(team.teamTypeName) }}
          </td>
          <td data-test="team_events">
            {{ buildEventsString(team.events) }}
          </td>
        </tr>
      </tbody>
    </v-simple-table>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcDialog } from '@crctech/component-library';
import { ITeamEvent, ITeamMemberData } from '@/entities/team';

export default Vue.extend({
  name: 'TeamMemberTeams',

  components: {
    RcDialog,
  },

  props: {
    member: {
      type: Object as () => ITeamMemberData,
      required: true,
    },
    show: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      teams: null,
      select: ['Events', 'TeamName', 'TeamTypeName'],
      orderBy: 'TeamName asc',
      filter: {
        TeamMembers: {
          any: {
            Id: {
              eq: this.member.id,
            },
          },
        },
      },
    };
  },

  computed: {
    isLoading(): boolean {
      return this.$store.state.team.searchLoading;
    },
  },

  mounted() {
    this.fetchMemberTeams();
  },

  methods: {
    async fetchMemberTeams() {
      const res = await this.$storage.team.actions.searchTeams({
        filter: this.filter,
        select: this.select,
        orderBy: this.orderBy,
      });

      if (res?.value) {
        this.teams = res.value;
      }
    },

    buildEventsString(events: ITeamEvent[]): string {
      if (events.length === 0) return '';
      return events.map((e: ITeamEvent) => this.$m(e.name)).join(', ');
    },
  },

});
</script>

<style scoped lang="scss">

.member_teams_table {
    margin: auto;
    width: 100%;
    height: 100%;
}

</style>
