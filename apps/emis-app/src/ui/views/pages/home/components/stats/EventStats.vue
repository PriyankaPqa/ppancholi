<template>
  <rc-stats-template
    :current-tab.sync="currentTab"
    data-test-prefix="event"
    :title="title"
    :loading="loadingEvents"
    :show-pagination="!!quickStats"
    :number-of-tabs="numberOfTabs">
    <template slot="top">
      <v-autocomplete-with-validation
        v-model="selectedEventId"
        class="pb-4"
        hide-details
        :label="$t('event_stats.select.label')"
        :item-text="(item) => $m(item.entity.name)"
        item-value="entity.id"
        outlined
        :placeholder="eventPlaceholder"
        :items="sortedEvents"
        @change="selectEvent" />
    </template>

    <template v-if="quickStats" slot="tip">
      {{ tip[0] }}
      <br>
      {{ tip[1] }}
    </template>

    <template slot="stats">
      <v-skeleton-loader v-if="loadingQuickStats" type="list-item-two-line" />
      <div v-if="quickStats">
        <div v-if="currentTab === 0" data-test="event_stats_tab_0">
          <div class="rc-body14 my-3">
            {{ $t('event_stats.open.label') }}
            <span class="fw-bold" data-test="event_stats_open_case_files">({{ openCount }})</span>
          </div>
          <div class="rc-body14 my-3">
            {{ $t('event_stats.closed.label') }} <span class="fw-bold" data-test="event_stats_closed_case_files">({{ quickStats.closedCount }})</span>
          </div>
          <div class="rc-body14">
            {{ $t('event_stats.inactive.label') }}
            <span class="fw-bold" data-test="event_stats_inactive_case_files">({{ quickStats.inactiveCount }})</span>
          </div>
        </div>
        <div v-if="currentTab === 1" data-test="event_stats_tab_1">
          <div class="rc-body14 my-3">
            {{ $t('event_stats.assigned.label') }}
            <span class="fw-bold" data-test="event_stats_assigned_case_files">({{ quickStats.openCount.assigned }})</span>
          </div>
          <div class="rc-body14 my-3">
            {{ $t('event_stats.unassigned.label') }}
            <span class="fw-bold" data-test="event_stats_unassigned_case_files">({{ quickStats.openCount.unAssigned }})</span>
          </div>
          <div class="rc-body14 my-3">
            {{ $t('event_stats.duplicate.label') }}
            <span class="fw-bold" data-test="event_stats_duplicate_case_files">({{ quickStats.openCount.duplicate }})</span>
          </div>
        </div>
        <div v-if="currentTab === 2" data-test="event_stats_tab_2">
          <div class="line">
            <div class="rc-body14">
              {{ $t('event_stats.tier1.label') }}
              <span class="fw-bold" data-test="event_stats_tier_1">({{ quickStats.caseFileTriageCounts.tier1 }})</span>
            </div>
            <div class="rc-body14">
              {{ $t('event_stats.tier2.label') }}
              <span class="fw-bold" data-test="event_stats_tier_2">({{ quickStats.caseFileTriageCounts.tier2 }})</span>
            </div>
          </div>
          <div class="line">
            <div class="rc-body14">
              {{ $t('event_stats.tier3.label') }}
              <span class="fw-bold" data-test="event_stats_tier_3">({{ quickStats.caseFileTriageCounts.tier3 }})</span>
            </div>
            <div class="rc-body14">
              {{ $t('event_stats.na.label') }}
              <span class="fw-bold" data-test="event_stats_tier_na">({{ quickStats.caseFileTriageCounts.tierNone }})</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </rc-stats-template>
</template>

<script lang="ts">
import Vue from 'vue';
import _sortBy from 'lodash/sortBy';
import { TranslateResult } from 'vue-i18n';
import { RcStatsTemplate, VAutocompleteWithValidation } from '@libs/component-lib/components';
import { IEventMainInfo } from '@/entities/event';
import { ICaseFileDetailedCount } from '@/entities/case-file';

export default Vue.extend({
  name: 'EventStats',

  components: {
    RcStatsTemplate,
    VAutocompleteWithValidation,
  },

  data() {
    return {
      events: [] as IEventMainInfo[],
      selectedEventId: null,
      loadingEvents: false,
      loadingQuickStats: false,
      currentTab: 0,
      numberOfTabs: 3,
      quickStats: null as ICaseFileDetailedCount,
      openCount: 0,
    };
  },
  computed: {
    title(): TranslateResult {
      return this.$t('event_stats.title');
    },

    tip(): TranslateResult[] {
      if (this.currentTab === 0) {
        return [this.$t('event_stats.tip.number_of_case_file'), this.$t('event_stats.tip.case_file_group_by.status')];
      }
      if (this.currentTab === 1) {
        return [this.$t('event_stats.tip.number_of_open_case_file'), this.$t('event_stats.tip.case_file_group_by.assigned')];
      }
      if (this.currentTab === 2) {
        return [this.$t('event_stats.tip.number_of_case_file'), this.$t('event_stats.tip.case_file_group_by.triage')];
      }
      return null;
    },

    eventPlaceholder(): TranslateResult {
      return this.$t('event_stats.event.placeholder');
    },

    sortedEvents(): IEventMainInfo[] {
      return _sortBy(this.events, (event: IEventMainInfo) => this.$m(event.entity.name));
    },
  },
  async created() {
    this.loadingEvents = true;
    const res = await this.$services.events.searchMyEvents({ top: 999 });
    this.loadingEvents = false;
    if (res) {
      this.events = res?.value;
    }
  },
  methods: {
    async selectEvent() {
      this.quickStats = null;
      this.currentTab = 0;
      this.loadingQuickStats = true;

      const caseFileDetailedCount = await this.$storage.caseFile.actions.fetchCaseFileDetailedCounts(this.selectedEventId);
      const caseFileCount = await this.$storage.caseFile.actions.fetchCaseFileAssignedCounts(this.selectedEventId, null);

      this.loadingQuickStats = false;

      if (caseFileDetailedCount && caseFileCount) {
        this.quickStats = caseFileDetailedCount;
        this.openCount = caseFileCount.openCount;
      }
    },
  },
});
</script>
<style lang="scss" scoped>
::v-deep .line {
  margin: 12px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
