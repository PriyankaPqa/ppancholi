<template>
  <page-template
    data-test="event-details-page"
    :loading="loading"
    :show-right-menu="showRightMenu"
    :left-menu-title="$m(event.entity.name)"
    :navigation-tabs="tabs">
    <template v-if="event" #left-menu>
      <div>
        <div class="rc-body14 pb-2">
          <v-icon size="16" class="pr-2" color="gray darken-2">
            mdi-calendar
          </v-icon>
          <span class="fw-bold">{{ $t('eventDetail.type') }}</span>
          <div class="pl-6" data-test="event-typeName">
            {{ eventTypeName ? $m(eventTypeName) : "" }}
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
          {{ provinceName }}
        </div>

        <div
          v-if="event.entity.location && event.entity.location.region && $m(event.entity.location.region)"
          class="rc-body14 pl-6"
          data-test="event-location-region">
          {{ $m(event.entity.location.region) }}
        </div>
      </div>

      <div v-if="showExpandedLeftMenu" data-test="expanded-left-menu">
        <div class="rc-body14 pb-2">
          <v-icon size="16" class="pr-2" color="gray darken-2">
            mdi-phone
          </v-icon>
          <span class="fw-bold">{{ $t('eventDetail.phone') }}</span>
          <div>
            <rc-phone-display class="pl-6" data-test="event-phone" :value="event.entity.responseDetails.assistanceNumber" />
          </div>
        </div>

        <div v-if="event.metadata && event.metadata.relatedEventsInfos && event.metadata.relatedEventsInfos.length" class="rc-body14 pb-2">
          <v-icon size="16" class="pr-2" color="gray darken-2">
            mdi-calendar
          </v-icon>
          <span class="fw-bold">{{ $t('eventDetail.relatedEvents') }}</span>
          <div v-for="(relatedEvent, i) in event.metadata.relatedEventsInfos" :key="relatedEvent.id" class="pl-6" :data-test="`related-event-${i}`">
            {{ $m(relatedEvent.eventName) }}
          </div>
        </div>
      </div>

      <div class="d-flex justify-center pt-1 pb-3">
        <v-icon size="26" class="toggle-left-menu-icon" color="gray darken-2" data-test="expand-button" @click="toggleExpandLeftMenu">
          {{ `mdi-chevron-${showExpandedLeftMenu ? 'up' : 'down'}` }}
        </v-icon>
      </div>
    </template>

    <router-view />

    <template #page-right-menu-top>
      <div class="pl-2">
        <v-icon size="24" class="mr-2" color="secondary">
          mdi-calendar
        </v-icon>
        <span class="rc-body14 fw-bold">{{ $t('eventDetail.eventDates') }}</span>
      </div>

      <div ref="dates" v-resize="onResize" class="dates">
        <div :class="['date', 'block-date', removeBorder ? 'no-border' : '']">
          <div class="rc-body12">
            {{ $t('eventDetail.created') }}
          </div>
          <div class="rc-body14 fw-bold" data-test="event-created-date">
            {{ getLocalStringDate(event.entity.created, 'Entity.created') }}
          </div>
        </div>

        <div class="date block-date">
          <div class="rc-body12">
            {{ $t('eventDetail.reported') }}
          </div>
          <div class="rc-body14 fw-bold" data-test="event-reported-date">
            {{ event.entity.responseDetails
              ? getLocalStringDate(event.entity.responseDetails.dateReported, 'EventResponseDetails.dateReported') : "-" }}
          </div>
        </div>

        <div v-for="(statusChange, $index) in statusHistory" :key="$index" class="date">
          <div class="rc-body12">
            {{ $t(statusChange.title) }}
          </div>

          <div class="rc-body14 fw-bold" data-test="status-change-date">
            {{ getLocalStringDate(statusChange.date, 'Entity.timestamp') }}
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
import { TranslateResult } from 'vue-i18n';
import _orderBy from 'lodash/orderBy';
import { RcPhoneDisplay } from '@libs/component-lib/components';
import moment from '@libs/shared-lib/plugins/moment';
import helpers from '@/ui/helpers/helpers';

import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import {
  EEventStatus, EventEntity, IEventCombined, IEventMetadata,
} from '@libs/entities-lib/event';
import { ECanadaProvinces, IMultilingual, INavigationTab } from '@libs/shared-lib/types';
import routes from '@/constants/routes';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';

import { Resize } from 'vuetify/es5/directives';

export default Vue.extend({
  name: 'EventDetails',

  directives: {
    Resize,
  },

  components: {
    RcPhoneDisplay,
    PageTemplate,
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
      removeBorder: false,
      showExpandedLeftMenu: false,
      idDigitsCount: 6,
      getLocalStringDate: helpers.getLocalStringDate,
      loading: false,
    };
  },

  computed: {
    event(): IEventCombined {
      return this.$storage.event.getters.get(this.id) || { entity: new EventEntity(), metadata: {} as IEventMetadata };
    },

    eventId() : string {
      return this.event?.entity.number?.toString().padStart(this.idDigitsCount, '0');
    },

    eventTypeName(): IMultilingual {
      if (this.event.entity.responseDetails?.eventType?.optionItemId == null) {
        return null;
      }
      const eventTypes = this.$storage.event.getters.eventTypes(false);

      const currentType = eventTypes?.find((t) => t.id === this.event.entity.responseDetails.eventType.optionItemId);
      return currentType?.name;
    },

    provinceName(): TranslateResult {
      const provinceCode = this.event?.entity?.location?.province;
      if (!provinceCode) {
        return null;
      }
      const isOther = provinceCode === ECanadaProvinces.OT;
      if (isOther) {
        return this.$m(this.event.entity.location.provinceOther);
      }
      return this.$t(`common.provinces.${ECanadaProvinces[provinceCode]}`);
    },

    tabs(): Array<INavigationTab> {
      const tabs = [{
        text: this.$t('eventDetail.menu_summary'),
        test: 'event-summary',
        icon: '',
        disabled: false,
        to: routes.events.summary.name,
        level: 'level4',
      }, {
        text: this.$t('eventDetail.menu_programs'),
        test: 'event-programs',
        icon: '',
        disabled: false,
        to: routes.programs.home.name,
        level: 'level6',
        exact: false,
      }, {
        text: this.$t('eventDetail.menu_financial'),
        test: 'event-financial-assistance',
        icon: '',
        disabled: false,
        to: routes.events.financialAssistance.home.name,
        level: 'level6',
        exact: false,
      },
      {
        text: this.$t('eventDetail.menu_approvals'),
        test: 'event-approvals',
        icon: '',
        disabled: false,
        to: routes.events.approvals.home.name,
        level: 'level6',
        feature: FeatureKeys.ApprovalsWithinEvent,
        exact: false,
      },
      {
        text: this.$t('eventDetail.menu_assessments'),
        test: 'event-assessments',
        icon: '',
        disabled: false,
        to: routes.events.assessments.home.name,
        level: 'level6',
        feature: FeatureKeys.Assessments,
        exact: false,
      }];

      return tabs;
    },

    statusHistory(): Array<Record<string, string>> {
      const sorted = _orderBy(this.event.entity.scheduleHistory, 'timestamp');

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

    showRightMenu(): boolean {
      return this.$route.name === routes.events.summary.name;
    },
  },

  async created() {
    this.loading = true;
    try {
      await this.$storage.event.actions.fetch(this.id, { useEntityGlobalHandler: true, useMetadataGlobalHandler: false });
      await this.$storage.event.actions.fetchEventTypes();
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
