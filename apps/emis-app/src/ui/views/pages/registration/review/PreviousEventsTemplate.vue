<template>
  <div>
    <div v-if="loading">
      <v-skeleton-loader class="my-6" type="article" />
      <v-skeleton-loader class="my-6" type="article" />
      <v-skeleton-loader class="my-6" type="article" />
    </div>
    <template v-if="caseFiles.length > 0">
      <div data-test="title__previousEvents" class="rc-heading-5 fw-bold mb-2">
        {{ $t('household.split.title.beneficiary_details.registered_in_events', { x: caseFiles.length }) }}
      </div>
      <div class="info-container mb-8">
        <div v-for="(c, index) in caseFiles" :key="index" class="row-data">
          <v-row dense>
            <v-col cols="6" class="rc-body14 fw-bold" :data-test="`previous_event_${index}`">
              {{ $m(eventNames[c.eventId]) }}
            </v-col>
            <v-col cols="3" class="rc-body14" :data-test="`previous_event_registered_${index}`">
              {{ $t('registration.details.registered') }}: {{ moment(c.registeredDate).format('ll') }}
            </v-col>
            <v-col cols="3" class="rc-body14" data-test="`previous_casefileNumber_${index}`">
              {{ $t('registration.details.caseFile') }}: {{ c.caseFileNumber }}
            </v-col>
          </v-row>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import moment from 'moment';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { IMultilingual } from '@libs/shared-lib/types';
import { IEventMainInfo } from '@libs/entities-lib/event';

export default Vue.extend({
  name: 'PreviousEventsTemplate',

  props: {
    householdId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      moment,
      events: [] as IEventMainInfo[],
      caseFiles: [] as ICaseFileEntity[],
      loading: false,
    };
  },
  computed: {
    eventNames(): Record<string, IMultilingual> {
      const names: Record<string, IMultilingual> = {};
      this.events?.forEach((e) => {
        names[e.entity.id] = e.entity.name;
      });
      return names;
    },
  },
  watch: {
    caseFiles() {
      this.fetchEvents();
    },
  },
  async mounted() {
    if (this.householdId) {
      await this.fetchCaseFilesInformation(this.householdId);
    }
  },
  methods: {
    async fetchEvents() {
      const eventIds = this.caseFiles.map((cf) => cf.eventId);
      if (!eventIds.length) {
        return;
      }
      const results = await this.$services.publicApi.searchEventsById(eventIds);
      this.events = results?.value as IEventMainInfo[];
    },

    async fetchCaseFilesInformation(householdId: string) {
      this.loading = true;
      try {
        const results = await this.$services.caseFiles.getAllCaseFilesRelatedToHouseholdId(householdId);
        if (results) {
          this.caseFiles = results;
        }
      } finally {
        this.loading = false;
      }
    },
  },
});
</script>

<style scoped lang="scss">
  .row-data {
    border: solid var(--v-grey-lighten2);
    border-width:1px 1px 0 1px;
    padding: 4px 16px;
    &:last-child {
      border-bottom-right-radius: 4px;
      border-bottom-left-radius: 4px;
      border-bottom: solid 1px var(--v-grey-lighten2);
    }
    &:first-child {
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }
  }

</style>
