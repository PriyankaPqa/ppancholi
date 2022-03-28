<template>
  <rc-stats-template :loading="loadingEvents" data-test-prefix="team" :title="$t('team_stats.title')">
    <template slot="top">
      <v-autocomplete-with-validation
        v-model="selectedEventId"
        data-test="team_stats_select_event"
        class="pb-4"
        hide-details
        :label="$t('team_stats.event.select.label')"
        :items="events"
        :item-text="(item) => $m(item.entity.name)"
        item-value="entity.id"
        outlined
        :placeholder="$t('team_stats.event.placeholder')"
        @change="selectEvent" />
      <v-autocomplete-with-validation
        v-model="selectedTeam"
        data-test="team_stats_select_team"
        class="pb-4"
        hide-details
        :label="$t('team_stats.team.select.label')"
        :loading="loadingTeams"
        outlined
        :disabled="!eventHasBeenSelected"
        :placeholder="$t('team_stats.team.placeholder')"
        return-object
        :items="statTeam"
        :item-text="(item) => item.entity.name"
        :item-value="(item) => item.entity.id"
        @change="selectTeam" />
    </template>

    <template slot="stats">
      <v-skeleton-loader v-if="loadingStats" type="list-item-two-line" />
      <div v-if="!loadingStats && statsLoaded && teamStats" data-test="team_stats_count">
        <div class="line rc-body14">
          <div>
            {{ $t('team_stats.team_members.label') }}
            <span class="fw-bold" data-test="team_stats_count_team_member">
              ({{ teamStats.countTeamMembers }})
            </span>
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
import { RcStatsTemplate, VAutocompleteWithValidation } from '@libs/component-lib/components';
import { IEntityCombined } from '@libs/registration-lib/entities/base';
import { EEventStatus, IEventMainInfo } from '@/entities/event';
import { ITeamEntity, ITeamMetadata } from '@/entities/team';

const defaultTeamStats = {
  countTeamMembers: 0,
  countClose: 0,
  countOpen: 0,
  countTotal: 0,
};

export default Vue.extend({
  name: 'TeamStats',

  components: {
    RcStatsTemplate,
    VAutocompleteWithValidation,
  },

  data() {
    return {
      events: [] as Array<IEventMainInfo>,
      selectedEventId: null,
      selectedTeam: null,
      teamStats: defaultTeamStats,
      loadingEvents: false,
      loadingTeams: false,
      statsLoaded: false,
      loadingStats: false,
      statTeam: [],
    };
  },
  computed: {
    eventHasBeenSelected(): boolean {
      return this.selectedEventId !== null;
    },
  },
  async mounted() {
    this.loadingEvents = true;
    await this.fetchActiveEvents();
    this.loadingEvents = false;
  },
  methods: {
    async fetchActiveEvents() {
      const res = await this.$services.events.searchMyEvents({
        filter: {
          Entity: {
            Schedule: {
              Status: EEventStatus.Open,
            },
          },
        },
        orderBy: `Entity/Name/Translation/${this.$i18n.locale} asc`,
        top: 999,
      });
      this.events = res?.value;
    },

    async selectEvent() {
      this.loadingTeams = true;
      this.statsLoaded = false;
      this.teamStats = defaultTeamStats;
      const eventTeams = await this.$storage.team.actions.search({
        filter: { Metadata: { Events: { any: { Id: this.selectedEventId } } } },
        orderBy: 'Entity/Name asc',
      });
      this.statTeam = this.$storage.team.getters.getByIds(eventTeams.ids);
      this.loadingTeams = false;
    },

    async selectTeam(selectedTeam: IEntityCombined<ITeamEntity, ITeamMetadata>) {
      this.statsLoaded = false;
      this.loadingStats = true;
      this.teamStats = defaultTeamStats;
      const team: IEntityCombined<ITeamEntity, ITeamMetadata> = this.statTeam.find((team) => team.entity.id === selectedTeam.entity.id);
      const countTeamMembers = team.entity.teamMembers.length;
      if (countTeamMembers !== 0) {
        const assignedCount = await this.$services.caseFiles.getCaseFileAssignedCounts({
          eventId: this.selectedEventId,
          teamId: selectedTeam.entity.id,
        });
        const countTotal = Object.values(assignedCount).reduce((acc, val) => acc + val, 0);
        this.teamStats = {
          countTotal,
          countOpen: assignedCount.openCount,
          countClose: assignedCount.closedCount,
          countTeamMembers,
        };
      }
      this.statsLoaded = true;
      this.loadingStats = false;
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
