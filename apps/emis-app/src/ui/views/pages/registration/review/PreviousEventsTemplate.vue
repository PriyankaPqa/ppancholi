<template>
  <div>
    <div v-if="loading">
      <v-skeleton-loader class="my-6" type="article" />
      <v-skeleton-loader class="my-6" type="article" />
      <v-skeleton-loader class="my-6" type="article" />
    </div>
    <template v-if="caseFiles.length > 0">
      <div data-test="title__previousEvents" class="rc-heading-5 fw-bold mb-2">
        {{ $t('household.split.title.beneficiary_details.registered_in_events', {x:caseFiles.length}) }}
      </div>
      <div class="info-container mb-8">
        <div v-for="(c, index) in caseFiles" :key="index" class="row-data">
          <v-row dense>
            <v-col cols="6" class="rc-body14 fw-bold" :data-test="`previous_event_${index}`">
              {{ $m(c.eventName) }}
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
import { IHouseholdCaseFile } from '@libs/entities-lib/household';

export default Vue.extend({
  name: 'PreviousEventsTemplate',
  props: {
    caseFiles: {
      type: Array as () => Array<IHouseholdCaseFile>,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      moment,
    };
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
