import mixins from 'vue-typed-mixins';
import helpers from '@/ui/helpers/helpers';
import _debounce from 'lodash/debounce';
import _throttle from 'lodash/throttle';
import {
  IAzureSearchParams, IAzureTableSearchResults, IMultilingual,
} from '@libs/shared-lib/types';
import { UserRolesNames } from '@libs/entities-lib/user';
import { FilterFormData } from '@libs/component-lib/types';

import EventsFilterMixin, { IDropdownItem } from '@/ui/mixins/eventsFilter';
import { Status } from '@libs/entities-lib/base';
import { IUserAccountCombined } from '@libs/entities-lib/src/user-account/userAccount.types';

const INITIAL_NUMBER_ITEMS = 6;
const VISUAL_DELAY = 500;

export default mixins(EventsFilterMixin).extend({
  data() {
    return {
      submittedToUsers: [] as IDropdownItem[],
      selectedSubmittedToUsers: [] as IDropdownItem[],
      submittedToQuery: null as string,

      submittedByUsers: [] as IDropdownItem[],
      selectedSubmittedByUsers: [] as IDropdownItem[],
      submittedByQuery: null as string,
      submittedLoading: { to: false, by: false },
    };
  },

  computed: {
    customColumns() {
      return { event: null, submittedTo: null, submittedBy: null };
    },
  },

  watch: {
    submittedToQuery(newVal: string) {
      if (newVal && newVal.trim().length > 0) {
        this.debounceSearchUsersFilter('to', newVal.trim());
      } else {
        this.submittedToUsers = this.selectedSubmittedToUsers;
      }
    },

    submittedByQuery(newVal: string) {
      if (newVal && newVal.trim().length > 0) {
        this.debounceSearchUsersFilter('by', newVal.trim());
      } else {
        this.submittedByUsers = this.selectedSubmittedByUsers;
      }
    },
  },

  methods: {
    async fetchUsers(toOrBy: 'to' | 'by', query = '', top = INITIAL_NUMBER_ITEMS) {
      this.submittedLoading[toOrBy as 'to' | 'by'] = true;

      const levels = toOrBy === 'to' ? [UserRolesNames.level3, UserRolesNames.level4] : null;
      const roles = this.$storage.userAccount.getters.rolesByLevels(levels);
      const res = await this.fetchUsersFilter(query, roles.map((r: { name: IMultilingual, id: string, status: Status }) => r.id), top);

      if (toOrBy === 'to') {
        this.submittedToUsers = [...res, ...this.selectedSubmittedToUsers];
      } else if (toOrBy === 'by') {
        this.submittedByUsers = [...res, ...this.selectedSubmittedByUsers];
      }

      await helpers.timeout(VISUAL_DELAY);
      this.submittedLoading[toOrBy] = false;
      return res;
    },

    async fetchUsersByIds(ids: Array<string>) {
      const params = {
        filter: { Entity: { Id: { searchIn_az: ids } } },
        top: 999,
      };
      return this.searchUserAccount(params);
    },

    async searchUserAccount(params: IAzureSearchParams) {
      const searchResult: IAzureTableSearchResults = await this.$storage.userAccount.actions.search(params);
      if (searchResult) {
        const users = this.$storage.userAccount.getters.getByIds(searchResult.ids);
        return users.map((u: IUserAccountCombined) => ({
          text: u.metadata.displayName,
          value: u.entity.id,
        }));
      }
      return [];
    },

    // eslint-disable-next-line @typescript-eslint/default-param-last
    async fetchUsersFilter(query = '', rolesId: Array<string>, top = 6) {
      const searchParam = helpers.toQuickSearch(query);
      const filter = `Entity/Roles/any(r: search.in(r/OptionItemId, '${rolesId.join(',')}'))`;
      const params = {
        search: searchParam,
        searchFields: 'Metadata/DisplayName',
        top,
        filter,
        orderBy: 'Metadata/DisplayName',
        queryType: 'full',
        searchMode: 'all',
      };

      return this.searchUserAccount(params);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debounceSearchUsersFilter: _debounce(function func(this: any, toOrBy: string, query: string) {
      this.fetchUsers(toOrBy, query, 20);
    }, 500),

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throttleOnLoadFilter: _throttle(function func(this: any, filterFormData: FilterFormData) {
      this.onLoadApprovalFilters(filterFormData);
    }, 500),

    /**
     * When loading a filter, we need to fetch items in case they are not contained in the initial load (top limitation)
     */
    async onLoadApprovalFilters(filterFormData: FilterFormData) {
      this.onLoadFilter(filterFormData, 'Metadata/EventId'); // Loading event filter from mixin

      const submittedToUsers = await this.getSelectedUsersForFilterKey('Entity/SubmittedTo/UserId', filterFormData);
      const submittedByUsers = await this.getSelectedUsersForFilterKey('Entity/SubmittedBy/UserId', filterFormData);

      this.submittedToUsers = [...submittedToUsers, ...this.submittedToUsers];
      this.submittedByUsers = [...submittedByUsers, ...this.submittedByUsers];
    },

    async getSelectedUsersForFilterKey(filterKey: string, filterFormData: FilterFormData) {
      const filterItems = filterFormData.values;

      if (!filterItems) {
        return [];
      }

      const filter = filterItems[filterKey];

      if (filter) {
        const selectedIds = filter.value as string[];
        return this.fetchUsersByIds(selectedIds);
      }
      return [];
    },

    /**
     * When a query has been typed in an autocomplete
     */
    onAutoCompleteUpdate({ filterKey, search, selectedItem }: { filterKey: string, search: string, selectedItem: IDropdownItem }) {
      if (search !== selectedItem?.text && filterKey === 'Metadata/EventId') {
        this.eventFilterQuery = search;
      }

      if (filterKey === 'Entity/SubmittedBy/UserId') {
        this.selectedSubmittedByUsers = this.$storage.userAccount.getters.getByIds(selectedItem).map((u: IUserAccountCombined) => ({
          text: u.metadata.displayName,
          value: u.entity.id,
        }));
        this.submittedByQuery = search;
      }

      if (filterKey === 'Entity/SubmittedTo/UserId') {
        this.selectedSubmittedToUsers = this.$storage.userAccount.getters.getByIds(selectedItem).map((u: IUserAccountCombined) => ({
          text: u.metadata.displayName,
          value: u.entity.id,
        }));
        this.submittedToQuery = search;
      }
    },

    /**
     * When opening the filter panel, items need to be fetched
     */
    onOpenFilters() {
      this.fetchEventsFilter();
      this.fetchUsers('to');
      this.fetchUsers('by');
    },
  },

});
