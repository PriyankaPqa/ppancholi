<template>
  <rc-stats-template
    :current-tab.sync="currentTab"
    data-test-prefix="event"
    :title="title"
    :loading="loadingEvents"
    :show-pagination="!!quickStats"
    :number-of-tabs="numberOfTabs">
    <template slot="top">
      <v-select-with-validation
        v-model="selectedEventId"
        class="pb-4"
        hide-details
        :label="$t('event_stats.select.label')"
        :item-text="(e) => $m(e.name)"
        item-value="id"
        outlined
        :placeholder="eventPlaceholder"
        :items="events"
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
            <span class="fw-bold" data-test="event_stats_open_case_files">({{ quickStats.countOpen }})</span>
          </div>
          <div class="rc-body14 my-3">
            {{ $t('event_stats.closed.label') }} <span class="fw-bold" data-test="event_stats_closed_case_files">({{ quickStats.countClose }})</span>
          </div>
          <div class="rc-body14">
            {{ $t('event_stats.inactive.label') }}
            <span class="fw-bold" data-test="event_stats_inactive_case_files">({{ quickStats.countInactive }})</span>
          </div>
        </div>
        <div v-if="currentTab === 1" data-test="event_stats_tab_1">
          <div class="rc-body14 my-3">
            {{ $t('event_stats.assigned.label') }}
            <span class="fw-bold" data-test="event_stats_assigned_case_files">({{ quickStats.countAssigned }})</span>
          </div>
          <div class="rc-body14 my-3">
            {{ $t('event_stats.unassigned.label') }}
            <span class="fw-bold" data-test="event_stats_unassigned_case_files">({{ quickStats.countUnassigned }})</span>
          </div>
          <div class="rc-body14 my-3">
            {{ $t('event_stats.duplicate.label') }}
            <span class="fw-bold" data-test="event_stats_duplicate_case_files">({{ quickStats.countDuplicated }})</span>
          </div>
        </div>
        <div v-if="currentTab === 2" data-test="event_stats_tab_2">
          <div class="line">
            <div class="rc-body14">
              {{ $t('event_stats.tier1.label') }}
              <span class="fw-bold" data-test="event_stats_tier_1">({{ quickStats.countTier[0] }})</span>
            </div>
            <div class="rc-body14">
              {{ $t('event_stats.tier2.label') }}
              <span class="fw-bold" data-test="event_stats_tier_2">({{ quickStats.countTier[1] }})</span>
            </div>
          </div>
          <div class="line">
            <div class="rc-body14">
              {{ $t('event_stats.tier3.label') }}
              <span class="fw-bold" data-test="event_stats_tier_3">({{ quickStats.countTier[2] }})</span>
            </div>
            <div class="rc-body14">
              {{ $t('event_stats.tier4.label') }}
              <span class="fw-bold" data-test="event_stats_tier_4">({{ quickStats.countTier[3] }})</span>
            </div>
          </div>
          <div class="line">
            <div class="rc-body14">
              {{ $t('event_stats.tier5.label') }}
              <span class="fw-bold" data-test="event_stats_tier_5">({{ quickStats.countTier[4] }})</span>
            </div>
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
  name: 'EventStats',

  components: {
    RcStatsTemplate,
    VSelectWithValidation,
  },

  data() {
    return {
      events: [],
      selectedEventId: null,
      loadingEvents: false,
      loadingQuickStats: false,
      currentTab: 0,
      numberOfTabs: 3,
      quickStats: null,
    };
  },
  computed: {
    title(): TranslateResult {
      return this.$t('event_stats.title');
    },

    tip(): TranslateResult[] {
      if (this.currentTab === 0) return [this.$t('event_stats.tip.number_of_case_file'), this.$t('event_stats.tip.case_file_group_by.status')];
      if (this.currentTab === 1) return [this.$t('event_stats.tip.number_of_open_case_file'), this.$t('event_stats.tip.case_file_group_by.assigned')];
      if (this.currentTab === 2) return [this.$t('event_stats.tip.number_of_case_file'), this.$t('event_stats.tip.case_file_group_by.triage')];
      return null;
    },

    eventPlaceholder(): TranslateResult {
      return this.$t('event_stats.event.placeholder');
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
      // this.quickStats = null;
      // this.currentTab = 0;
      // this.loadingQuickStats = true;
      //
      // const res = await this.$services.caseFiles.countCaseFileByEvent(eventId);
      // this.loadingQuickStats = false;
      //
      // if (res.success) this.quickStats = res.data;
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
