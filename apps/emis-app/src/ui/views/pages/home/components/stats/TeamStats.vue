<template>
  <rc-stats-template data-test-prefix="team" :title="$t('team_stats.title')">
    <template #top>
      <events-selector
        v-model="selectedEventId"
        async-mode
        item-value="id"
        data-test="team_stats_select_event"
        class="pb-4"
        hide-details
        :label="$t('team_stats.event.select.label')"
        @change="selectEvent($event)" />
      <v-autocomplete-with-validation
        v-model="selectedTeam"
        data-test="team_stats_select_team"
        class="pb-4"
        clearable
        hide-details
        :label="$t('team_stats.team.select.label')"
        :loading="loadingTeams"
        outlined
        :disabled="!eventHasBeenSelected"
        :placeholder="$t('team_stats.team.placeholder')"
        return-object
        :items="statTeam"
        :item-text="(item) => item.name"
        :item-value="(item) => item.id"
        @change="selectTeam" />
    </template>

    <template #stats>
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
import EventsSelector from '@/ui/shared-components/EventsSelector.vue';
import { ITeamEntity } from '@libs/entities-lib/team';
import { useTeamStore } from '@/pinia/team/team';
import { EFilterKeyType } from '@libs/component-lib/types';

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
    EventsSelector,
    VAutocompleteWithValidation,
  },

  data() {
    return {
      selectedEventId: null,
      selectedTeam: null,
      teamStats: defaultTeamStats,
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
  methods: {
    async selectEvent(id: string) {
      this.selectedEventId = id;
      if (!this.selectedEventId) {
        this.selectedTeam = null;
        this.teamStats = null;
        return;
      }

      this.loadingTeams = true;
      this.statsLoaded = false;
      this.teamStats = defaultTeamStats;
      const eventTeams = await useTeamStore().search({ params: {
        filter: { Entity: { Events: { any: { Id: { value: this.selectedEventId, type: EFilterKeyType.Guid } } } } },
        orderBy: 'Entity/Name asc',
      },
      includeInactiveItems: false,
      otherSearchEndpointParameters: { manageableTeamsOnly: true } });
      if (eventTeams) {
        this.statTeam = useTeamStore().getByIds(eventTeams.ids);
      }
      this.loadingTeams = false;
    },

    async selectTeam(selectedTeam: ITeamEntity) {
      if (!selectedTeam) {
        this.teamStats = null;
        return;
      }
      this.statsLoaded = false;
      this.loadingStats = true;
      this.teamStats = defaultTeamStats;
      const team: ITeamEntity = this.statTeam.find((team) => team.id === selectedTeam.id);
      const countTeamMembers = team.teamMembers.length;
      if (countTeamMembers !== 0) {
        const assignedCount = await this.$services.caseFiles.getCaseFileAssignedCounts({
          eventId: this.selectedEventId,
          teamId: selectedTeam.id,
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
