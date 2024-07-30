<template>
  <div class="pa-4">
    <rc-data-table
      data-test="bookings-table"
      :items="tableData"
      :count="itemsCount"
      :table-props="tableProps"
      :labels="labels"
      :headers="headers"
      :footer-text="footerText"
      :custom-columns="Object.values(customColumns)"
      :options.sync="options"
      :initial-search="params && params.search"
      @search="search">
      <template #filter>
        <filter-toolbar
          :filter-key="FilterKey.BookingRequests"
          :count="itemsCount"
          :filter-options="filters"
          :initial-filter="filterState"
          add-filter-label="bookingRequests.filter"
          @open="fetchEventsFilter()"
          @update:autocomplete="onAutoCompleteUpdate($event)"
          @update:appliedFilter="onApplyFilter"
          @load:filter="throttleOnLoadFilter($event, 'Metadata/EventId')" />
      </template>

      <template #[`item.${customColumns.caseFileNumber}`]="{ item }">
        <router-link
          class="rc-link14 font-weight-bold"
          :data-test="`cf_link_${item.id}`"
          :to="getCaseFileDetailsRoute(item)">
          {{ item.caseFileNumber }}
        </router-link>
      </template>

      <template #[`item.${customColumns.primaryMemberName}`]="{ item }">
        <router-link
          class="rc-link14 font-weight-bold"
          :data-test="`cf_link_${item.id}`"
          :to="getHouseholdProfileRoute(item)">
          {{ item.primaryMemberName }}
        </router-link>
      </template>

      <template #[`item.${customColumns.eventName}`]="{ item }">
        {{ item.eventName }}
      </template>

      <template #[`item.${customColumns.numberOfRooms}`]="{ item }">
        {{ item.numberOfRooms }}
      </template>

      <template #[`item.${customColumns.checkIn}`]="{ item }">
        {{ getLocalStringDate(item.checkIn, 'BookingRequest.checkIn') }}
      </template>

      <template #[`item.${customColumns.checkOut}`]="{ item }">
        {{ getLocalStringDate(item.checkOut, 'BookingRequest.checkOut') }}
      </template>

      <template #[`item.${customColumns.roomOptions}`]="{ item }">
        {{ item.roomOptionsStr }}
      </template>

      <template #[`item.${customColumns.action}`]="{ item }">
        <v-btn :data-test="`action_${item.id}`" @click="actionItem(item)">
          {{ $t('bookingRequest.action') }}
        </v-btn>
      </template>
    </rc-data-table>
  </div>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';
import {
  RcDataTable,
} from '@libs/component-lib/components';
import { DataTableHeader } from 'vuetify';
import { EDateMode, EFilterKeyType, EFilterType, IFilterSettings } from '@libs/component-lib/types/FilterTypes';
import mixins from 'vue-typed-mixins';
import routes from '@/constants/routes';
import EventsFilterMixin from '@/ui/mixins/eventsFilter';
import { FilterKey } from '@libs/entities-lib/user-account';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { ISearchParams, Status } from '@libs/shared-lib/types';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import helpers from '@/ui/helpers/helpers';
import { usePersonStore } from '@/pinia/person/person';
import { useEventStore } from '@/pinia/event/event';
import { useHouseholdStore } from '@/pinia/household/household';
import { BookingRequestState, IBookingRequest, RoomOption } from '@libs/entities-lib/booking-request';
import { useBookingRequestStore } from '@/pinia/booking-request/booking-request';
import { useCaseFileStore } from '@/pinia/case-file/case-file';

export default mixins(TablePaginationSearchMixin, EventsFilterMixin).extend({
  name: 'TeamsTable',

  components: {
    RcDataTable,
    StatusChip,
    FilterToolbar,
  },

  data() {
    return {
      getLocalStringDate: helpers.getLocalStringDate,
      FilterKey,
      Status,
      options: {
        page: 1,
        sortBy: ['Metadata/CaseFileNumber'],
      },
    };
  },

  computed: {
    tableData(): (IBookingRequest & { primaryMemberName: string, eventName: string, roomOptionsStr: string, caseFileNumber: string })[] {
      const results = useBookingRequestStore().getByIdsWithPinnedItems(this.searchResultIds, { baseDate: this.searchExecutionDate }).map((b) => ({
        booking: b,
        primaryMember: usePersonStore().getById(useHouseholdStore().getById(b.householdId)?.primaryBeneficiary),
        casefile: useCaseFileStore().getById(b.caseFileId),
      }));

      const options = helpers.enumToTranslatedCollection(RoomOption, 'enums.RoomOption');

      return results.map((r) => ({
        ...r.booking,
        primaryMemberName: `${r.primaryMember?.identitySet?.firstName} ${r.primaryMember?.identitySet?.lastName}`,
        eventName: this.$m(useEventStore().getById(r.casefile?.eventId)?.name),
        roomOptionsStr: (r.booking.roomOptions || []).map((o) => options.find((o2) => o2.value === o)?.text).join(', '),
        caseFileNumber: r.casefile.caseFileNumber,
      }));
    },

    labels(): { header: { title: TranslateResult; searchPlaceholder: TranslateResult } } {
      const title = this.$t('bookingRequests.title');
      return {
        header: {
          title,
          searchPlaceholder: this.$t('common.inputs.quick_search'),
        },
      };
    },

    customColumns(): Record<string, string> {
      return {
        caseFileNumber: 'Metadata/CaseFileNumber',
        primaryMemberName: 'Metadata/PrimaryMemberName',
        eventName: `Metadata/EventName/Translation/${this.$i18n.locale}`,
        numberOfRooms: 'Entity/NumberOfRooms',
        checkIn: 'Entity/CheckIn',
        checkOut: 'Entity/CheckOut',
        roomOptions: `Metadata/RoomOptionStr/Translation/${this.$i18n.locale}`,
        action: 'action',
      };
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('bookingRequest.caseFileNumber') as string,
          sortable: true,
          value: this.customColumns.caseFileNumber,
        },
        {
          text: this.$t('bookingRequest.primaryMemberName') as string,
          value: this.customColumns.primaryMemberName,
          sortable: true,
        },
        {
          text: this.$t('bookingRequest.eventName') as string,
          value: this.customColumns.eventName,
          sortable: true,
        },
        {
          text: this.$t('bookingRequest.numberOfRooms') as string,
          value: this.customColumns.numberOfRooms,
          sortable: true,
        },
        {
          text: this.$t('bookingRequest.checkIn') as string,
          value: this.customColumns.checkIn,
          sortable: true,
        },
        {
          text: this.$t('bookingRequest.checkOut') as string,
          value: this.customColumns.checkOut,
          sortable: true,
        },
        {
          text: this.$t('bookingRequest.roomOptions') as string,
          value: this.customColumns.roomOptions,
          sortable: false,
        },
        {
          text: '',
          value: this.customColumns.action,
          sortable: false,
        },
      ];
    },

    tableProps(): Record<string, unknown> {
      return {
        loading: useBookingRequestStore().searchLoading,
        itemClass: (item: IBookingRequest) => (item.pinned ? 'pinned' : ''),
      };
    },

    filters(): Array<IFilterSettings> {
      return [
        {
          key: 'Metadata/EventId',
          keyType: EFilterKeyType.Guid,
          type: EFilterType.Select,
          label: this.$t('bookingRequest.eventName') as string,
          items: this.sortedEventsFilter,
          loading: this.eventsFilterLoading,
          props: {
            'no-data-text': !this.eventFilterQuery ? this.$t('common.inputs.start_typing_to_search') : this.$t('common.search.no_result'),
            'search-input': this.eventFilterQuery,
            'no-filter': true,
            'return-object': true,
            placeholder: this.$t('common.filters.autocomplete.placeholder'),
          },
        },
        {
          key: 'Entity/CheckIn',
          type: EFilterType.Date,
          dateMode: EDateMode.Static,
          label: this.$t('bookingRequest.checkIn') as string,
        },
        {
          key: 'Entity/CheckOut',
          type: EFilterType.Date,
          dateMode: EDateMode.Static,
          label: this.$t('bookingRequest.checkOut') as string,
        },
      ];
    },
  },

  created() {
    this.saveState = true;
    this.loadState();
  },

  methods: {
    getCaseFileDetailsRoute(item: IBookingRequest) {
      return {
        name: routes.caseFile.activity.name,
        params: {
          id: item.caseFileId,
        },
      };
    },

    getHouseholdProfileRoute(item: IBookingRequest) {
      return {
        name: routes.household.householdProfile.name,
        params: {
          id: item.householdId,
        },
      };
    },

    actionItem(item: IBookingRequest) {
      return item;
    },

    async fetchData(params: ISearchParams) {
      const filterParams = Object.keys(params.filter).length > 0 ? params.filter as Record<string, unknown> : {} as Record<string, unknown>;
      const res = await useBookingRequestStore().search({ params: {
        filter: { ...filterParams, 'Entity/State': helpers.getEnumKeyText(BookingRequestState, BookingRequestState.Pending) },
        top: params.top,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
      } });

      const items = res.values;

      const hhs = await useHouseholdStore().fetchByIds(items.map((x) => x.householdId), true);
      usePersonStore().fetchByIds(hhs.map((x) => x.primaryBeneficiary), true);
      const cfs = await useCaseFileStore().fetchByIds(items.map((x) => x.caseFileId), true);
      useEventStore().fetchByIds(cfs.map((x) => x.eventId), true);

      return res;
    },
  },
});
</script>
