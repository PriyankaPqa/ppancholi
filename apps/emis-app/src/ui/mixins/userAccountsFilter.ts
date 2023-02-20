import Vue from 'vue';
import helpers from '@/ui/helpers/helpers';
import sharedHelpers from '@libs/shared-lib/helpers/helpers';
import _debounce from 'lodash/debounce';
import _throttle from 'lodash/throttle';
import {
  IAzureSearchParams, IAzureTableSearchResults, IDropdownItem, IMultilingual,
} from '@libs/shared-lib/types';
import { FilterFormData } from '@libs/component-lib/types';
import { Status } from '@libs/entities-lib/base';
import { IUserAccountCombined } from '@libs/entities-lib/src/user-account/userAccount.types';
import { useUserAccountMetadataStore, useUserAccountStore } from '@/pinia/user-account/user-account';
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';
import { IdParams, IUserAccountEntity, IUserAccountMetadata } from '@libs/entities-lib/user-account';

const INITIAL_NUMBER_ITEMS = 6;
const VISUAL_DELAY = 500;

export default Vue.extend({

  data() {
    return {
      userAccountFilterState: {
        default: {
          users: [] as IDropdownItem[],
          selectedUsers: [] as IDropdownItem[],
          query: '',
          loading: false,
          levels: null as string[],
          filterKey: '',
        },
      },
      combinedUserAccountStore: new CombinedStoreFactory<IUserAccountEntity, IUserAccountMetadata, IdParams>(useUserAccountStore(), useUserAccountMetadataStore()),
    };
  },

  methods: {
    async fetchUsers(query = '', key = 'default', top = INITIAL_NUMBER_ITEMS) {
      const stateKey = key as keyof typeof this.userAccountFilterState;
      this.userAccountFilterState[stateKey].loading = true;

      const levels = this.userAccountFilterState[stateKey].levels;
      const roles = levels ? useUserAccountStore().rolesByLevels(levels) : null;
      const res = await this.fetchUsersFilter(query, roles?.map((r: { name: IMultilingual, id: string, status: Status }) => r.id), top);
      const mappedUsers = res.map((u: IUserAccountCombined) => ({
        text: u.metadata.displayName,
        value: u.entity.id,
      }));
      this.userAccountFilterState[stateKey].users = [...mappedUsers, ...(this.userAccountFilterState[stateKey].selectedUsers || [])];

      await helpers.timeout(VISUAL_DELAY);
      this.userAccountFilterState[stateKey].loading = false;
      return res;
    },

    async fetchUsersByIds(ids: Array<string>) {
      const params = {
        filter: { Entity: { Id: { searchIn_az: ids } } },
        top: 999,
      };
      return this.searchUserAccount(params);
    },

    // eslint-disable-next-line @typescript-eslint/default-param-last
    async fetchUsersFilter(query = '', rolesId: Array<string>, top = 6) {
      const searchParam = helpers.toQuickSearch(query);
      const params = {
        search: searchParam,
        searchFields: 'Metadata/DisplayName',
        top,
        orderBy: 'Metadata/DisplayName',
        queryType: 'full',
        searchMode: 'all',
      };

      let searchResults;
      if (rolesId?.length) {
        searchResults = await sharedHelpers.callSearchInInBatches({
          ids: rolesId,
          searchInFilter: "Entity/Roles/any(r: search.in(r/OptionItemId, '{ids}'))",
          otherOptions: params,
          service: this.combinedUserAccountStore,
        });
      } else {
        searchResults = await this.combinedUserAccountStore.search(params);
      }

      if (searchResults?.ids) {
        const userIds = searchResults.ids;
        return this.combinedUserAccountStore.getByIds(userIds);
      }
      return [];
    },

    async searchUserAccount(params: IAzureSearchParams) {
      const searchResult: IAzureTableSearchResults = await this.combinedUserAccountStore.search(params);
      if (searchResult) {
        return this.combinedUserAccountStore.getByIds(searchResult.ids);
      }
      return [];
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debounceSearchUsersFilter: _debounce(function func(this: any, query: string, key: string) {
      this.fetchUsers(query, key, 20);
    }, 500),

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throttleOnLoadFilter: _throttle(function func(this: any, filterFormData: FilterFormData) {
      this.onLoadApprovalFilters(filterFormData);
    }, 500),

    /**
     * When loading a filter, we need to fetch users in case they are not contained in the initial load (top limitation)
     */
    async onLoadUserAccountFilters(filterFormData: FilterFormData) {
      Object.keys(this.userAccountFilterState).forEach(async (key) => {
        const users = await this.getSelectedUsersForFilterKey(this.userAccountFilterState[key as keyof typeof this.userAccountFilterState].filterKey, filterFormData);
        const stateKey = key as keyof typeof this.userAccountFilterState;
        this.userAccountFilterState[stateKey].users = [...users, ...this.userAccountFilterState[stateKey].users];
      });
    },

    async getSelectedUsersForFilterKey(filterKey: string, filterFormData: FilterFormData) {
      const filterItems = filterFormData.values;

      if (!filterItems) {
        return [];
      }

      const filter = filterItems[filterKey];

      if (filter) {
        const selectedIds = filter.value as string[];
        const users = await this.fetchUsersByIds(selectedIds);
        return users.map((u: IUserAccountCombined) => ({
          text: u.metadata.displayName,
          value: u.entity.id,
        }));
      }
      return [];
    },

    /**
     * When a query has been typed in an autocomplete
     */
    onUserAutoCompleteUpdate({ filterKey, search, selectedItem }: { filterKey: string, search: string, selectedItem?: string[] }) {
      let stateKey = 'default' as keyof typeof this.userAccountFilterState;
      Object.keys(this.userAccountFilterState).forEach((key) => {
        if (this.userAccountFilterState[key as keyof typeof this.userAccountFilterState].filterKey === filterKey) {
          stateKey = key as keyof typeof this.userAccountFilterState;
        }
      });

      if (selectedItem) {
        this.userAccountFilterState[stateKey].selectedUsers = this.combinedUserAccountStore.getByIds(selectedItem).map((u: IUserAccountCombined) => ({
          text: u.metadata.displayName,
          value: u.entity.id,
        }));
      }
      this.userAccountFilterState[stateKey].query = search;

      if (search && search.trim().length > 0) {
        this.debounceSearchUsersFilter(search.trim(), stateKey);
      } else {
        this.userAccountFilterState[stateKey].users = this.userAccountFilterState[stateKey].selectedUsers;
      }
    },
  },
});
