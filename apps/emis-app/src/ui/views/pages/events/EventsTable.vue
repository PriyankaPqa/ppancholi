<template>
  <rc-data-table
    ref="eventsTable"
    data-test="events-table"
    :show-help="false && $hasLevel('level6')"
    :help-link="$t(helpLink)"
    :items="tableData"
    :count="itemsCount"
    :headers="headers"
    :footer-text="footerText"
    :labels="labels"
    :table-props="tableProps"
    :show-add-button="$hasLevel('level6')"
    :initial-search="params && params.search"
    :options.sync="options"
    :custom-columns="[
      customColumns.name,
      customColumns.responseLevel,
      customColumns.openDate,
      customColumns.daysOpen,
      customColumns.eventStatus,
      'editButton',
    ]"
    @add-button="addEvent"
    @search="search">
    <template v-if="!isDashboard" #filter>
      <filter-toolbar
        :filter-key="FilterKey.Events"
        :filter-options="filters"
        :initial-filter="filterState"
        :count="itemsCount"
        add-filter-label="eventsTable.filter.title"
        @update:appliedFilter="onApplyFilter" />
    </template>

    <template #[`item.${customColumns.name}`]="{ item: event }">
      <router-link
        class="rc-link14 font-weight-bold"
        :data-test="`eventDetail-link_${ $m(event.entity.name) }`"
        :to="getEventRoute(event)">
        {{ $m(event.entity.name) }}
      </router-link>
    </template>

    <template #[`item.${customColumns.responseLevel}`]="{ item: event }">
      {{ $m(event.metadata.responseLevelName) }}
    </template>

    <template #[`item.${customColumns.openDate}`]="{ item: event }">
      {{ event.entity.schedule ? getFormattedDate(event.entity.schedule.openDate) : "" }}
    </template>

    <template #[`item.${customColumns.daysOpen}`]="{ item: event }">
      {{ getDaysOpen(event.entity.schedule) }}
    </template>

    <template #[`item.${customColumns.eventStatus}`]="{ item: event }">
      <status-chip status-name="EEventStatus" :status="event.entity.schedule ? event.entity.schedule.status : 0" />
    </template>

    <template #[`item.editButton`]="{ item }">
      <v-btn v-if="canEdit(item)" icon class="mr-2" data-test="edit_event" @click="goToEditEvent(item)">
        <v-icon size="24" color="grey darken-2">
          mdi-pencil
        </v-icon>
      </v-btn>
    </template>
  </rc-data-table>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';
import {
  RcDataTable,
} from '@libs/component-lib/components';
import { DataTableHeader } from 'vuetify';
import { EFilterType, IFilterSettings, ISearchData } from '@libs/component-lib/types';
import mixins from 'vue-typed-mixins';
import { FilterKey } from '@libs/entities-lib/user-account';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import {
  EResponseLevel,
  EEventStatus,
  IEventEntity,
  IEventMetadata,
  IEventCombined,
  IEventSchedule,
} from '@libs/entities-lib/event';
import helpers from '@/ui/helpers/helpers';
import { IAzureSearchParams } from '@libs/shared-lib/types';
import routes from '@/constants/routes';
import moment from '@libs/shared-lib/plugins/moment';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { useEventStore, useEventMetadataStore } from '@/pinia/event/event';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { CombinedStoreFactory } from '@/pinia/base/combinedStoreFactory';

export default mixins(TablePaginationSearchMixin).extend({
  name: 'EventsTable',

  components: {
    RcDataTable,
    FilterToolbar,
    StatusChip,
  },

  props: {
    isDashboard: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      FilterKey,
      routes,
      loading: false,
      EResponseLevel,
      EEventStatus,
      helpLink: 'zendesk.help_link.eventsTable',
      options: {
        page: 1,
        sortBy: ['Entity/Schedule/OpenDate'],
        sortDesc: [true],
      },
      combinedEventStore: new CombinedStoreFactory<IEventEntity, IEventMetadata>(useEventStore(), useEventMetadataStore()),
    };
  },

  computed: {
    tableData(): IEventCombined[] {
      return this.combinedEventStore.getByIds(this.searchResultIds, { prependPinnedItems: true, baseDate: this.searchExecutionDate });
    },

    customColumns(): Record<string, string> {
      return {
        name: `Entity/Name/Translation/${this.$i18n.locale}`,
        responseLevel: `Metadata/ResponseLevelName/Translation/${this.$i18n.locale}`,
        openDate: 'Entity/Schedule/OpenDate',
        daysOpen: 'DaysOpen',
        eventStatus: `Metadata/ScheduleEventStatusName/Translation/${this.$i18n.locale}`,
      };
    },

    labels(): { header: { title: TranslateResult; searchPlaceholder: TranslateResult, addButtonLabel: TranslateResult } } {
      return {
        header: {
          title: this.$t('eventsTable.title'),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
          addButtonLabel: this.$t('eventsTable.addEvent'),
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

    filters(): Array<IFilterSettings> {
      return [{
        key: this.customColumns.name,
        type: EFilterType.Text,
        label: this.$t('eventsTable.name') as string,
      }, {
        key: this.customColumns.responseLevel,
        type: EFilterType.MultiSelect,
        label: this.$t('eventsTable.levelInteger') as string,
        items: helpers.enumToTranslatedCollection(EResponseLevel, 'event.response_level', true),
      }, {
        key: this.customColumns.openDate,
        type: EFilterType.Date,
        label: this.$t('eventsTable.startDate') as string,
      }, {
        key: this.customColumns.eventStatus,
        type: EFilterType.MultiSelect,
        label: this.$t('eventsTable.eventStatus') as string,
        items: helpers.enumToTranslatedCollection(EEventStatus, 'eventsTable.eventStatus', true),
      }];
    },

    tableProps(): Record<string, unknown> {
      return {
        loading: useEventStore().searchLoading,
        itemClass: (item: IEventCombined) => (item.pinned ? 'pinned' : ''),
      };
    },

    canEdit(): (event: IEventCombined) => boolean {
      return (event) => this.$hasLevel('level5')
      && (event.entity.schedule.status === EEventStatus.Open || event.entity.schedule.status === EEventStatus.OnHold);
    },
  },

  async created() {
    this.saveState = true;
    this.loadState();
  },

  methods: {
    addEvent() {
      this.$router.push({ name: routes.events.create.name });
    },

    async fetchData(params: IAzureSearchParams) {
      const res = await this.combinedEventStore.search({
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

    getEventRoute(event: IEventCombined) {
      const isFeatureFlagEnabled = this.$hasFeature(FeatureKeys.LetIMViewEventDetails); // TODO EMISV2-6088
      if (isFeatureFlagEnabled && this.$hasRole('contributorIM')) {
        return {
          name: routes.events.summaryForIM.name,
          params: {
            id: event.entity.id,
          },
        };
      }
      return {
        name: routes.events.summary.name,
        params: {
          id: event.entity.id,
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
      if (!schedule) {
        return null;
      }
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

    goToEditEvent(event: IEventCombined) {
      this.$router.push({ name: routes.events.edit.name, params: { id: event.entity.id } });
    },

    getTableName():string {
      return 'events';
    },
  },
});
</script>
