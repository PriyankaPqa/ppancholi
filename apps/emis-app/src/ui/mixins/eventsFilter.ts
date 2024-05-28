import Vue from 'vue';
import helpers from '@/ui/helpers/helpers';
import helper from '@libs/shared-lib/helpers/helpers';
import _debounce from 'lodash/debounce';
import _throttle from 'lodash/throttle';
import { IDropdownItem } from '@libs/shared-lib/types';
import { FilterFormData } from '@libs/component-lib/types';
import _sortBy from 'lodash/sortBy';
import {
  EEventStatus,
} from '@libs/entities-lib/event';

const INITIAL_NUMBER_ITEMS = 6;
const VISUAL_DELAY = 500;

export default Vue.extend({
  data() {
    return {
      eventsFilter: [],
      eventFilterQuery: null,
      eventsFilterLoading: false,
      eventsFilterDisabled: false,
      isInitialLoad: true,
      selectedEvent: [],
      openEventsOnly: false,
    };
  },
  computed: {
    sortedEventsFilter(): IDropdownItem[] {
      return _sortBy(this.eventsFilter, (event: IDropdownItem) => event.text);
    },
  },
  watch: {
    eventFilterQuery(newVal) {
      if (newVal && newVal.trim().length > 0) {
        this.debounceSearchEventsFilter(newVal.trim());
      } else {
        this.eventsFilter = [];
      }
    },
  },
  methods: {
    async fetchEventsFilter(query = '', top = INITIAL_NUMBER_ITEMS) {
      this.eventsFilterLoading = true;
      if (this.isInitialLoad) {
        this.eventsFilterDisabled = true;
      }
      const searchParam = helpers.toQuickSearchSql(query, `Entity/Name/Translation/${this.$i18n.locale}`);
      const params = {
        filter: {
          or: [
            {
              Entity: {
                Schedule: {
                  Status: helper.getEnumKeyText(EEventStatus, EEventStatus.Open),
                },
              },
            }, this.openEventsOnly ? null
              : {
                Entity: {
                  Schedule: {
                    Status: helper.getEnumKeyText(EEventStatus, EEventStatus.OnHold),
                  },
                },
            },
          ],
          ...searchParam,
        },
        top,
        orderBy: 'Entity/Schedule/OpenDate desc',
        queryType: 'full',
        searchMode: 'all',
      };

      const res = await this.$services.events.search(params);
      await helpers.timeout(VISUAL_DELAY);
      this.eventsFilterLoading = false;
      if (this.isInitialLoad) {
        this.eventsFilterDisabled = false;
        this.isInitialLoad = false;
      }

      if (res?.value) {
        this.eventsFilter = res.value.map((e) => ({
          text: this.$m(e.entity.name),
          value: e.entity.id,
        }));
      }
    },

    /**
     * When loading a filter, we need to fetch the selected event in case it is not contains in the initial load
     * @param filterFormData
     */
    async onLoadFilter(filterFormData: FilterFormData, filterKey = 'Entity/EventId') {
      const filterItems = filterFormData.values;
      if (!filterItems) {
        return;
      }
      const eventFilter = filterItems[filterKey];
      if (eventFilter) {
        const selectedId = ((eventFilter.value) as unknown as IDropdownItem).value;
        this.selectedEvent = await this.fetchEventsByIds([selectedId]);
        if (this.selectedEvent) {
          // If we already have events in the dropdown, we append
          this.eventsFilter = [...this.selectedEvent, ...this.eventsFilter];
        }
      }
      await this.onLoadAdditionalFilters(filterFormData);
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async onLoadAdditionalFilters(_filterFormData: FilterFormData) {
      // to be redefined if needed
    },

    async fetchEventsByIds(ids: Array<string>) {
      this.eventsFilterLoading = true;
      const res = await this.$services.events.search({
        filter: `Entity/Id in(${ids.join(',')})`,
        top: 999,
      });
      await helpers.timeout(VISUAL_DELAY);
      this.eventsFilterLoading = false;
      if (res?.value) {
        return res.value.map((e) => ({
          text: this.$m(e.entity.name),
          value: e.entity.id,
        }));
      }
      return [];
    },

    /**
     * Update the query with what has been typed in the autocomplete, unless we select an item
     */
    onAutoCompleteUpdate(
      { filterKey, search, selectedItem }:
      { filterKey: string, search: string, selectedItem: IDropdownItem },
    ) {
      if ((filterKey === 'Entity/EventId' || filterKey === 'Metadata/EventId' || filterKey === 'SearchItem/EventId') && search !== selectedItem?.text) {
        this.eventFilterQuery = search;
      }
    },

    /**
     * Triggered when a user click on a filter. Need to be throttle as it is triggered several times. Could not find the reason why.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throttleOnLoadFilter: _throttle(function func(this:any, filterFormData: FilterFormData, filterKey = 'Entity/EventId') {
      this.onLoadFilter(filterFormData, filterKey);
    }, 500),

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debounceSearchEventsFilter: _debounce(function func(this:any, query: string) {
      this.fetchEventsFilter(query);
    }, 500),
  },
});
