<template>
  <rc-data-table
    data-test="events-table"
    :show-help="$hasLevel('level6')"
    :help-link="$t(helpLink)"
    :items="azureSearchItems"
    :count="azureSearchCount"
    :headers="headers"
    :labels="labels"
    :table-props="tableProps"
    :show-add-button="$hasLevel('level6')"
    :options.sync="options"
    :custom-columns="[
      customColumns.name, customColumns.responseLevel, customColumns.openDate, customColumns.daysOpen, customColumns.eventStatus, 'editButton'
    ]"
    @add-button="addEvent"
    @search="search">
    <!-- <template v-if="!isDashboard" #filter>
      <filter-toolbar
        filter-key="EFilterKey.Events"
        :filter-options="filters"
        :count="count"
        @update:appliedFilter="onApplyFilter($event)" />
    </template> -->

    <template #[`item.${customColumns.name}`]="{ item: event }">
      <router-link
        class="rc-link14 font-weight-bold"
        data-test="eventDetail-link"
        :to="getEventRoute(event)">
        {{ $m(event.name) }}
      </router-link>
    </template>

    <template #[`item.${customColumns.responseLevel}`]="{ item: event }">
      {{ $t(`event.response_level.${EResponseLevel[event.responseDetails.responseLevel]}`) }}
    </template>

    <template #[`item.${customColumns.openDate}`]="{ item: event }">
      {{ event.schedule ? getFormattedDate(event.schedule.openDate) : "" }}
    </template>

    <template #[`item.${customColumns.daysOpen}`]="{ item: event }">
      {{ getDaysOpen(event.schedule) }}
    </template>

    <template #[`item.${customColumns.eventStatus}`]="{ item: event }">
      <status-chip status-name="EEventStatus" :status="event.schedule? event.schedule.status: 0" />
    </template>

    <template #[`item.editButton`]="{ item }">
      <v-btn v-if="$hasLevel('level5')" icon class="mr-2" data-test="edit_event" @click="goToEditEvent(item)">
        <v-icon size="24" color="grey darken-2">
          mdi-pencil
        </v-icon>
      </v-btn>
    </template>
  </rc-data-table>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import {
  RcDataTable,
  ISearchData,
} from '@crctech/component-library';
import { DataTableHeader } from 'vuetify';
import {
  EResponseLevel, EEventStatus, IEvent, IEventSchedule,
} from '@/entities/event';

import { IAzureSearchParams } from '@/types';
import routes from '@/constants/routes';
import moment from '@/ui/plugins/moment';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';

export default Vue.extend({
  name: 'EventsTable',

  components: {
    RcDataTable,
    // FilterToolbar,
    StatusChip,
  },

  mixins: [TablePaginationSearchMixin],

  props: {
    isDashboard: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      routes,
      loading: false,
      EResponseLevel,
      EEventStatus,
      helpLink: 'zendesk.help_link.eventsTable',
      options: {
        page: 1,
        sortBy: ['Schedule/OpenDate'],
        sortDesc: [true],
      },
    };
  },

  computed: {
    customColumns(): Record<string, string> {
      return {
        name: `EventName/Translation/${this.$i18n.locale}`,
        responseLevel: `ResponseLevelName/Translation/${this.$i18n.locale}`,
        openDate: 'Schedule/OpenDate',
        daysOpen: 'DaysOpen',
        eventStatus: `ScheduleEventStatusName/Translation/${this.$i18n.locale}`,
      };
    },

    labels(): { header: { title: TranslateResult; searchPlaceholder: TranslateResult } } {
      return {
        header: {
          title: this.$t('eventsTable.title'),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
        },
      };
    },

    headers(): Array<DataTableHeader> {
      return [{
        text: this.$t('eventsTable.name') as string,
        align: 'start',
        sortable: true,
        value: this.customColumns.name,
        width: '50%',
      }, {
        text: this.$t('eventsTable.levelInteger') as string,
        value: this.customColumns.responseLevel,
        sortable: true,
      }, {
        text: this.$t('eventsTable.startDate') as string,
        value: this.customColumns.openDate,
        sortable: true,
      }, {
        text: this.$t('eventsTable.eventDuration') as string,
        value: this.customColumns.daysOpen,
        sortable: false,
      }, {
        text: this.$t('eventsTable.eventStatus') as string,
        value: this.customColumns.eventStatus,
        sortable: true,
      }, {
        align: 'end',
        text: '',
        value: 'editButton',
        sortable: false,
      }];
    },

    // filters(): Array<IFilterSettings> {
    //   return [{
    //     key: this.customColumns.name,
    //     type: EFilterType.Text,
    //     label: this.$t('eventsTable.name') as string,
    //   }, {
    //     key: 'ResponseLevel',
    //     type: EFilterType.Select,
    //     label: this.$t('eventsTable.levelInteger') as string,
    //     items: helpers.enumToTranslatedCollection(EResponseLevel, 'event.response_level'),
    //   }, {
    //     key: 'OpenDate',
    //     type: EFilterType.Date,
    //     label: this.$t('eventsTable.startDate') as string,
    //     startLabel: this.$t('common.start') as string,
    //     endLabel: this.$t('common.end') as string,
    //   }, {
    //     key: 'ScheduleEventStatusName',
    //     type: EFilterType.Select,
    //     label: this.$t('eventsTable.eventStatus') as string,
    //     items: [{
    //       text: this.$t('eventsTable.eventStatus.Open') as string,
    //       value: EEventStatus.Open,
    //     }, {
    //       text: this.$t('eventsTable.eventStatus.OnHold') as string,
    //       value: EEventStatus.OnHold,
    //     }, {
    //       text: this.$t('eventsTable.eventStatus.Closed') as string,
    //       value: EEventStatus.Closed,
    //     }, {
    //       text: this.$t('eventsTable.eventStatus.Archived') as string,
    //       value: EEventStatus.Archived,
    //     }],
    //   }];
    // },

    tableProps(): Record<string, string> {
      return {
        loading: this.$store.state.event.searchLoading,
      };
    },
  },

  methods: {
    addEvent() {
      this.$router.push({ name: routes.events.create.name });
    },

    async fetchData(params: IAzureSearchParams) {
      const res = await this.$storage.event.actions.searchEvents({
        search: params.search,
        filter: params.filter,
        top: params.top,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
        queryType: 'full',
        searchMode: 'all',
      });
      return res;
    },

    getFilterParams(params: ISearchData) {
      return {
        or: [
          {
            [this.customColumns.name]: {
              or: [
                { contains_az: params.search },
                { startsWith_az: params.search },
              ],
            },
            // add more props to search on if needed
          },
        ],
      };
    },

    getEventRoute(event: IEvent) {
      return {
        name: routes.events.summary.name,
        params: {
          id: event.id,
        },
      };
    },

    getFormattedDate(date: string | Date) {
      if (date) {
        return moment(date).format('ll');
      }
      return '-';
    },

    getDaysOpen(schedule: IEventSchedule): number {
      if (!schedule) return null;
      const { openDate, closeDate, scheduledOpenDate } = schedule;
      if (openDate && closeDate) {
        return moment(closeDate).startOf('day').diff(moment(openDate).startOf('day'), 'days');
      }
      if (openDate) {
        return moment(moment()).startOf('day').diff(moment(openDate).startOf('day'), 'days');
      }

      if (scheduledOpenDate) {
        return moment(scheduledOpenDate).startOf('day').diff(moment(moment()).startOf('day'), 'days');
      }
      return null;
    },

    goToEditEvent(event: IEvent) {
      this.$router.push({ name: routes.events.edit.name, params: { id: event.id } });
    },
  },
});
</script>
