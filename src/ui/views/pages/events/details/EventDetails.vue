<template>
  <page-template
    :loading="loading"
    :show-right-menu="true"
    :left-menu-title="$m(event.name)"
    :navigation-tabs="tabs">
    <template v-if="event" slot="left-menu">
      <div>
        <div class="rc-body14 pb-2">
          <v-icon size="16" class="pr-2" color="gray darken-2">
            mdi-calendar
          </v-icon>
          <span class="fw-bold">{{ $t('eventDetail.type') }}</span>
          <div class="pl-6" data-test="event-typeName">
            {{ $m(event.eventTypeName) }}
          </div>
        </div>
      </div>

      <div class="rc-body14 pb-2">
        <v-icon size="16" class="pr-2" color="gray darken-2">
          mdi-calendar
        </v-icon>
        <span class="fw-bold">{{ $t('eventDetail.eventID') }}</span>
        <div class="pl-6" data-test="event-id">
          {{ eventId }}
        </div>
      </div>

      <div class="rc-body14 pb-2">
        <v-icon size="16" class="pr-2" color="gray darken-2">
          mdi-map-marker
        </v-icon>
        <span class="fw-bold">{{ $t('eventDetail.location') }}</span>

        <div class="pl-6" data-test="event-location-province">
          {{ $m(event.provinceName) }}
        </div>

        <div v-if="event.location.region && $m(event.location.region)" class="rc-body14 pl-6" data-test="event-location-region">
          {{ $m(event.location.region) }}
        </div>
      </div>

      <div v-if="showExpandedLeftMenu" data-test="expanded-left-menu">
        <div class="rc-body14 pb-2">
          <v-icon size="16" class="pr-2" color="gray darken-2">
            mdi-phone
          </v-icon>
          <span class="fw-bold">{{ $t('eventDetail.phone') }}</span>
          <div>
            <rc-phone-display class="pl-6" data-test="event-phone" :value="event.responseDetails.assistanceNumber" />
          </div>
        </div>

        <div v-if="event.relatedEventsInfos.length" class="rc-body14 pb-2">
          <v-icon size="16" class="pr-2" color="gray darken-2">
            mdi-calendar
          </v-icon>
          <span class="fw-bold">{{ $t('eventDetail.relatedEvents') }}</span>
          <div v-for="relatedEvent in event.relatedEventsInfos" :key="relatedEvent.id" class="pl-6" :data-test="`related-event`">
            {{ $m(relatedEvent.eventName) }}
          </div>
        </div>
      </div>

      <div class="d-flex justify-center pt-1 pb-3">
        <v-icon size="26" class="toggle-left-menu-icon" color="gray darken-2" @click="toggleExpandLeftMenu">
          {{ `mdi-chevron-${showExpandedLeftMenu? 'up': 'down'}` }}
        </v-icon>
      </div>
    </template>

    <template slot="default">
      <event-summary />
    </template>

    <template slot="page-right-menu-top">
      <div class="pl-2">
        <v-icon size="24" class="mr-2" color="secondary">
          mdi-calendar
        </v-icon>
        <span class="rc-body14 fw-bold">{{ $t('eventDetail.eventDates') }}</span>
      </div>

      <div ref="dates" v-resize="onResize" class="dates">
        <div :class="['date', 'block-date', removeBorder? 'no-border': '']">
          <div class="rc-body12">
            {{ $t('eventDetail.created') }}
          </div>
          <div class="rc-body14 fw-bold" data-test="event-created-date">
            {{ getStringDate(event.created) }}
          </div>
        </div>

        <div class="date block-date">
          <div class="rc-body12">
            {{ $t('eventDetail.reported') }}
          </div>
          <div class="rc-body14 fw-bold" data-test="event-reported-date">
            {{ getStringDate(event.responseDetails.dateReported) }}
          </div>
        </div>

        <div v-for="(statusChange, $index) in statusHistory" :key="$index" class="date">
          <div class="rc-body12">
            {{ $t(statusChange.title) }}
          </div>

          <div class="rc-body14 fw-bold" data-test="status-change-date">
            {{ getStringDate(statusChange.date) }}
          </div>

          <template v-if="statusChange.reason">
            <div class="rc-body12">
              {{ $t('eventDetail.dates.reason') }}
            </div>

            <div class="rc-body14 fw-bold" data-test="status-change-reason">
              {{ statusChange.reason }}
            </div>
          </template>
        </div>
      </div>
      <v-divider />
    </template>
  </page-template>
</template>

<script lang="ts">
import Vue from 'vue';
import moment from '@/ui/plugins/moment';
import _orderBy from 'lodash/orderBy';
import helpers from '@/ui/helpers';

import { RcPhoneDisplay } from '@crctech/component-library';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import { EEventStatus, Event, IEvent } from '@/entities/event';
import { INavigationTab } from '@/types';
import routes from '@/constants/routes';
import EventSummary from './EventSummary.vue';

export default Vue.extend({
  name: 'EventDetails',

  components: {
    RcPhoneDisplay,
    PageTemplate,
    EventSummary,
  },

  props: {
    /**
     * The id of the current event
     */
    id: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      moment,
      error: false,
      removeBorder: false,
      showExpandedLeftMenu: false,
      idDigitsCount: 6,
      getStringDate: helpers.getStringDate,
      loading: false,
    };
  },

  computed: {
    event(): IEvent {
      return this.$storage.event.getters.eventById(this.id) || new Event();
    },

    eventId() : string {
      return this.event?.number?.toString().padStart(this.idDigitsCount, '0');
    },

    tabs(): Array<INavigationTab> {
      return [{
        text: this.$t('eventDetail.menu_summary'),
        test: 'event-summary',
        icon: '',
        disabled: false,
        to: routes.events.details.name,
      }];
    },

    statusHistory(): Array<Record<string, string>> {
      const sorted = _orderBy(this.event.scheduleHistory, 'timestamp');

      return sorted.map((s) => {
        const item = {
          title: '',
          date: s.timestamp as string,
          reason: s.updateReason,
        };

        if (s.status === EEventStatus.Open) {
          item.title = 'eventDetail.open';
        } else if (s.status === EEventStatus.OnHold) {
          item.title = 'event.status.onHold';
        } else if (s.status === EEventStatus.Closed) {
          item.title = 'eventDetail.closed';
        } else if (s.status === EEventStatus.Archived) {
          item.title = 'eventDetail.archived';
        }

        return item;
      });
    },
  },

  async created() {
    this.loading = true;

    try {
      await this.$storage.event.actions.fetchEvent(this.id);
    } catch {
      this.error = true;
    } finally {
      this.loading = false;
    }
  },

  methods: {
    /**
    * Change the style of the dates in the top right of the page
    * when the size of the element is smaller than a specific size.
    */
    onResize(): void {
      const element = this.$refs.dates as HTMLElement;
      if (element) {
        this.removeBorder = (element.offsetWidth < 225);
      }
    },

    toggleExpandLeftMenu(): void {
      this.showExpandedLeftMenu = !this.showExpandedLeftMenu;
    },
  },
});
</script>

<style scoped lang="scss">

  .dates {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    padding-left: 24px;
    margin-bottom: 8px;
    min-width: 100px;

    & .date {
      padding-top: 8px;
      padding-left: 16px;
      padding-bottom: 6px;
      min-width: 100px;
      flex-basis: 100%;

      &:not(.block-date){
        border-top: 1px solid var(--v-grey-lighten2);
      }

      &.block-date {
        flex: 0 50%;
        &.no-border:first-child {
          flex-basis: 100%;
          border-bottom: 1px solid var(--v-grey-lighten2);
        }
        &:first-child:not(.no-border) {
          border-right: 1px solid var(--v-grey-lighten2);
        }

      }
    }
  }
</style>
