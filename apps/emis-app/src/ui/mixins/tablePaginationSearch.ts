import _isEmpty from 'lodash/isEmpty';
import _cloneDeep from 'lodash/cloneDeep';
import _debounce from 'lodash/debounce';
import Vue from 'vue';
import helpers from '@/ui/helpers/helpers';
import { IAzureTableSearchResults, IAzureSearchParams } from '@libs/shared-lib/types';
import { useUiStateStore } from '@/pinia/ui-state/uiState';

export default Vue.extend({
  data() {
    return {
      sqlSearchMode: false,
      quicksearchField: 'metadata/searchableText' as string,
      saveState: false,
      route: this.$route.path,
      azureSearchParams: {
        search: '',
        skip: 0,
        top: 0,
        orderBy: '',
        filter: {},
      },
      previousPageIndex: 0,
      userFilters: null as Record<string, unknown>,
      userSearchFilters: '',
      params: null as IAzureSearchParams & { pageSize?: number, pageIndex?: number, descending?: boolean },
      forceSkip: false, // when apply or un-apply user filter
      options: {
        page: 1,
      },
      searchResultIds: [] as string [],
      itemsCount: 0,
      searchExecutionDate: null as Date,
      filterState: null as unknown,
      searchTerm: '', // Custom search from outside the data table
    };
  },

  computed: {
    /**
     * Number of item to select
     */
    getTop(): number {
      return this.params.pageSize;
    },

    footerText(): string {
      return this.searchExecutionDate
        ? this.$t('searchTable.footer', { date: helpers.getLocalStringDate(this.searchExecutionDate, 'local', 'PPp') }) as string : '';
    },

    /**
     * Calculate the skip to paginated results
     */
    getSkip(): number {
      const {
        pageIndex,
        pageSize,
        search,
      } = this.params;

      const skip = (pageIndex - 1) * pageSize;

      if (this.isNewPageIndex || !this.forceSkip) {
        return skip;
      }

      const searchOngoing = search && search.length > 0;
      if (searchOngoing || this.forceSkip) {
        return 0;
      }
      return skip;
    },

    /**
     * Generate the order by to sort columns
     */
    getOrderBy(): string {
      const { orderBy, descending } = this.params;
      const direction = descending ? 'desc' : 'asc';
      return `${orderBy} ${direction}`;
    },

    isNewPageIndex(): boolean {
      const { pageIndex } = this.params;
      return this.previousPageIndex !== pageIndex;
    },

    presetFilter() {
      return null;
    },
  },

  methods: {
    /**
     * Build pagination parameters to sent for azure
     */
    setPaginationParams() {
        const {
          orderBy,
          pageIndex,
        } = this.params;

        this.azureSearchParams.skip = this.getSkip;
        this.azureSearchParams.top = this.getTop;
        this.previousPageIndex = pageIndex;

        if (orderBy) {
          this.azureSearchParams.orderBy = this.getOrderBy;
        }
    },

    setFilterParams() {
      if (!_isEmpty(this.userFilters)) {
        this.azureSearchParams.filter = {
          and: this.userFilters,
        };
      } else {
        this.azureSearchParams.filter = '';
      }
    },

    setSearchParams() {
      if (!this.sqlSearchMode) {
        const quickSearch = helpers.toQuickSearch(this.params.search || this.searchTerm);
        if (this.userSearchFilters && quickSearch) {
          this.azureSearchParams.search = `${this.userSearchFilters} AND ${quickSearch}`;
        } else if (this.userSearchFilters) {
          this.azureSearchParams.search = `${this.userSearchFilters}`;
        } else {
          this.azureSearchParams.search = quickSearch;
        }
      } else {
        const quickSearch = helpers.toQuickSearchSql(`${this.params.search || this.searchTerm || ''} ${this.userSearchFilters || ''}`, this.quicksearchField);
        if (!quickSearch) {
          return;
        }
        this.azureSearchParams.filter = this.azureSearchParams.filter || {};
        this.azureSearchParams.filter = { and: [
            this.azureSearchParams.filter,
            quickSearch,
          ],
        };
      }
    },

    /**
     * Triggered as soon as a parameter of the table has changed (sort, pagination, search)
     */
    async search(params: IAzureSearchParams) {
      this.params = params;
      this.setPaginationParams();

      this.setFilterParams();

      const containsSearchOnly = !this.azureSearchParams?.filter || _isEmpty(this.azureSearchParams.filter);
      this.setSearchParams();
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const res = await (this as any).fetchData(this.azureSearchParams, containsSearchOnly) as IAzureTableSearchResults;

      if (res) {
        this.itemsCount = res.count;
        this.searchResultIds = res.ids;
        this.searchExecutionDate = res.date;
      }

      this.setState();
      await this.onSearchComplete();
    },

    async onSearchComplete() {
      // to override if needed
    },

    setState() {
      if (!this.saveState) {
        return;
      }

      const uiStateKey = this.getTableName() + this.route;
      useUiStateStore().setSearchTableState(uiStateKey, _cloneDeep({
        azureSearchParams: this.azureSearchParams,
        previousPageIndex: this.previousPageIndex,
        userFilters: this.userFilters,
        userSearchFilters: this.userSearchFilters,
        params: this.params,
        options: this.options,
        searchResultIds: this.searchResultIds,
        itemsCount: this.itemsCount,
        searchExecutionDate: this.searchExecutionDate,
        filterState: this.filterState,
        ...this.additionalFilters(),
      }));
    },

    additionalFilters() {
      return {};
    },

    loadState() {
      if (!this.saveState || !this.route) {
        return;
      }

      const uiStateKey = this.getTableName() + this.route;

      // eslint-disable-next-line
      let state = useUiStateStore().getSearchTableState(uiStateKey) as any;

      if (state) {
        state = _cloneDeep(state);
        this.azureSearchParams = state.azureSearchParams;
        this.previousPageIndex = state.previousPageIndex;
        this.userFilters = state.userFilters;
        this.userSearchFilters = state.userSearchFilters;
        this.params = state.params;
        this.options = state.options;
        this.searchResultIds = state.searchResultIds;
        this.itemsCount = state.itemsCount;
        this.searchExecutionDate = state.searchExecutionDate;
        this.filterState = state.filterState;
      }
      this.setAdditionalFilters(state);
    },

    // eslint-disable-next-line
    setAdditionalFilters(_state: unknown) {
      return true;
    },

    /**
     * Triggered when a user apply or un-apply a filter
     */
    async onApplyFilter({ preparedFilters, searchFilters }: { preparedFilters: Record<string, unknown>; searchFilters?: string }, filterState?: any) {
      this.forceSkip = true;
      this.options.page = 1;
      this.userFilters = _isEmpty(preparedFilters) ? null : preparedFilters;
      this.userFilters = this.presetFilter ? { ...this.userFilters, ...this.presetFilter } : this.userFilters;
      this.userSearchFilters = searchFilters;
      this.filterState = filterState;
      await this.search(this.params);
      this.forceSkip = false;
    },

    onSearchTermInput(value: string) {
      const oldValue = this.searchTerm;
      this.searchTerm = value;
      if (value == null || (value != null && oldValue != null && value.trim() === oldValue.trim())) {
        return;
      }

      this.forceSkip = true;
      this.params = this.params || {};
      this.goToFirstPage();
      this.params.search = value;
      this.debounceSearch(this.params);
      this.forceSkip = false;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debounceSearch: _debounce(function func(this:any, value) {
      this.search(value);
    }, 500),

    goToFirstPage() {
      this.params.pageIndex = 1;
      this.options.page = 1;
    },

    getTableName() {
      return '';
    },

  },
});
