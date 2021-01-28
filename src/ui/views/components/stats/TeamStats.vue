<template>
  <rc-stats-template data-test-prefix="team" :title="title" :loading="loadingEvents">
    <template slot="top">
      <v-select-with-validation
        v-model="selectedEventId"
        data-test="team_stats_select_event"
        class="pb-4"
        hide-details
        :label="$t('team_stats.event.select.label')"
        :item-text="(e) => $m(e.name)"
        item-value="id"
        outlined
        :placeholder="eventPlaceholder"
        :items="events"
        @change="selectEvent" />
      <v-select-with-validation
        v-model="selectedTeam"
        class="pb-4"
        hide-details
        :label="$t('team_stats.team.select.label')"
        :loading="loadingTeams"
        outlined
        :disabled="!eventHasBeenSelected"
        :placeholder="teamPlaceholder"
        item-text="name"
        return-object
        :items="teams"
        @change="selectTeam" />
    </template>

    <template slot="stats">
      <v-skeleton-loader v-if="loadingStats" type="list-item-two-line" />
      <div v-if="teamStats">
        <div class="line rc-body14">
          <div>
            {{ $t('team_stats.team_members.label') }} <span class="fw-bold" data-test="team_stats_count_team_member">({{ countTeamMembers }})</span>
          </div>
          <div>
            {{ $t('team_stats.open.label') }} <span class="fw-bold" data-test="team_stats_open_case_files">({{ teamStats.countOpen }})</span>
          </div>
        </div>
        <div class="line rc-body14">
          <div>
            {{ $t('team_stats.case_files.label') }} <span class="fw-bold" data-test="team_stats_total_case_files">({{ teamStats.countTotal }})</span>
          </div>
          <div>
            {{ $t('team_stats.closed.label') }} <span class="fw-bold" data-test="team_stats_closed_case_files">({{ teamStats.countClose }})</span>
          </div>
        </div>
      </div>
    </template>
  </rc-stats-template>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { RcStatsTemplate, VSelectWithValidation } from '@rctech/component-library';

export default Vue.extend({
  name: 'TeamStats',

  components: {
    RcStatsTemplate,
    VSelectWithValidation,
  },

  data() {
    return {
      events: [],
      teams: [],
      selectedEventId: null,
      selectedTeam: null,
      teamStats: null,

      loadingEvents: false,
      loadingTeams: false,
      loadingStats: false,
    };
  },
  computed: {
    eventHasBeenSelected(): boolean {
      return this.selectedEventId !== null;
    },

    title(): TranslateResult {
      return this.$t('team_stats.title');
    },

    eventPlaceholder(): TranslateResult {
      return this.$t('team_stats.event.placeholder');
    },

    teamPlaceholder(): TranslateResult {
      return this.$t('team_stats.team.placeholder');
    },

    countTeamMembers(): number {
      return this.selectedTeam?.users.length ?? 0;
    },
  },
  async created() {
    // Fetch active events user has access to
    this.loadingEvents = false;
    // const res = await this.$services.events.selectEventNameForEventStatus();
    // this.loadingEvents = false;
    // if (res.success) {
    //   this.events = res.data;
    // }
  },
  methods: {
    async selectEvent() {
      // this.loadingTeams = true;
      // this.teamStats = null;
      // this.selectedTeam = null;
      // this.teams = [];
      //
      // const res = await this.$services.events.getEventTeams(eventId);
      // this.loadingTeams = false;
      //
      // if (res.success) this.teams = res.data;
    },

    async selectTeam() {
      // this.loadingStats = true;
      // this.teamStats = null;
      //
      // const res = await this.$services.caseFiles.countCaseFileByTeam(team.id, this.selectedEventId);
      // this.loadingStats = false;
      //
      // if (res.success) {
      //   this.teamStats = {
      //     ...res.data,
      //     countTotal: res.data.countOpen + res.data.countClose + res.data.countInactive,
      //   };
      // }
    },
  },
});
</script>
<style lang="scss" scoped>
::v-deep .line {
  margin: 3px 0 12px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
