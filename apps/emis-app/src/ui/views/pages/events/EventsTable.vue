<template>
  <rc-data-table
    ref="eventsTable"
    data-test="events-table"
    :show-help="false && $hasLevel(UserRoles.level6)"
    :help-link="$t(helpLink)"
    :items="tableData"
    :count="itemsCount"
    :headers="headers"
    :footer-text="footerText"
    :labels="labels"
    :table-props="tableProps"
    :show-add-button="$hasLevel(UserRoles.level6)"
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
        :data-test="`eventDetail-link_${ event.name && event.name.translation.en }`"
        :to="getEventRoute(event)">
        {{ $m(event.name) }}
      </router-link>
    </template>

    <template #[`item.${customColumns.responseLevel}`]="{ item: event }">
      {{ $t(`enums.ResponseLevel.Level${event.responseDetails.responseLevel}`) }}
    </template>

    <template #[`item.${customColumns.openDate}`]="{ item: event }">
      {{ event.schedule ? getLocalStringDate(event.schedule.openDate, 'EventSchedule.openDate', 'PP') : "" }}
    </template>

    <template #[`item.${customColumns.daysOpen}`]="{ item: event }">
      {{ getDaysOpen(event.schedule) }}
    </template>

    <template #[`item.${customColumns.eventStatus}`]="{ item: event }">
      <status-chip status-name="EEventStatus" :status="event.schedule ? event.schedule.status : 0" />
    </template>

    <template #[`item.editButton`]="{ item }">
      <v-btn v-if="canEdit(item)" icon class="mr-2" data-test="edit_event" :aria-label="$t('common.buttons.edit')" @click="goToEditEvent(item)">
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
import { EFilterType, IFilterSettings } from '@libs/component-lib/types';
import mixins from 'vue-typed-mixins';
import { FilterKey } from '@libs/entities-lib/user-account';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import { EResponseLevel, EEventStatus, IEventEntity, IEventSchedule } from '@libs/entities-lib/event';
import { UserRoles } from '@libs/entities-lib/user';
import helpers from '@/ui/helpers/helpers';
import { ISearchParams } from '@libs/shared-lib/types';
import routes from '@/constants/routes';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { useEventStore } from '@/pinia/event/event';
import { differenceInDays, format, startOfDay } from 'date-fns';

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
      getLocalStringDate: helpers.getLocalStringDate,
      EResponseLevel,
      EEventStatus,
      UserRoles,
      helpLink: 'zendesk.help_link.eventsTable',
      options: {
        page: 1,
        sortBy: ['Entity/Schedule/OpenDate'],
        sortDesc: [true],
      },
    };
  },

  computed: {
    tableData(): IEventEntity[] {
      return useEventStore().getByIdsWithPinnedItems(this.searchResultIds, { baseDate: this.searchExecutionDate });
    },

    customColumns(): Record<string, string> {
      return {
        name: `Entity/Name/Translation/${this.$i18n.locale}`,
        responseLevel: `Metadata/ResponseLevel/Translation/${this.$i18n.locale}`,
        openDate: 'Entity/Schedule/OpenDate',
        daysOpen: 'DaysOpen',
        eventStatus: `Metadata/EventStatus/Translation/${this.$i18n.locale}`,
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
        text: this.$t('common.edit') as string,
        class: 'rc-transparent-text',
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
        itemClass: (item: IEventEntity) => (item.pinned ? 'pinned' : ''),
      };
    },

    canEdit(): (event: IEventEntity) => boolean {
      return (event) => this.$hasLevel(UserRoles.level5)
      && (event.schedule.status === EEventStatus.Open || event.schedule.status === EEventStatus.OnHold);
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

    async fetchData(params: ISearchParams) {
      const res = await useEventStore().search({ params: {
        filter: params.filter,
        top: params.top,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
      },
      includeInactiveItems: false });

      return res;
    },

    getEventRoute(event: IEventEntity) {
      return {
        name: routes.events.summary.name,
        params: {
          id: event.id,
        },
      };
    },

    getFormattedDate(date: string | Date) {
      if (date) {
        return format(new Date(date), 'PP');
      }
      return '-';
    },

    getDaysOpen(schedule: IEventSchedule): number {
      if (!schedule) {
        return null;
      }
      const { openDate, closeDate, scheduledOpenDate } = schedule;
      if (openDate && closeDate) {
        return differenceInDays(new Date(closeDate), new Date(openDate));
      }
      if (openDate) {
        return differenceInDays(startOfDay(new Date()), startOfDay(new Date(openDate)));
      }

      if (scheduledOpenDate) {
        return differenceInDays(startOfDay(new Date(scheduledOpenDate)), startOfDay(new Date()));
      }
      return null;
    },

    goToEditEvent(event: IEventEntity) {
      this.$router.push({ name: routes.events.edit.name, params: { id: event.id } });
    },

    getTableName():string {
      return 'events';
    },
  },
});
</script>
