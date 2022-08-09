import _isEmpty from 'lodash/isEmpty';
import _cloneDeep from 'lodash/cloneDeep';
import Vue from 'vue';
import helpers from '@/ui/helpers/helpers';
import { IAzureTableSearchResults, IAzureSearchParams } from '@libs/shared-lib/types';

export default Vue.extend({
  data() {
    return {
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
        ? this.$t('searchTable.footer', { date: helpers.getLocalStringDate(this.searchExecutionDate, 'local', 'lll') }) as string : '';
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
      let quickSearch = '';

      if (this.params.search) {
        // any quick search will be treated as a Contains on all searchable fields
        // this splits the search by space and verifies Contains or Equal (like in filters)
        quickSearch = this.params.search.split(' ').filter((x) => x !== '')
          .map((v) => helpers.sanitize(v))
          .map((v) => `(/.*${v}.*/ OR "\\"${v}\\"")`)
          .join(' AND ');
        quickSearch = `(${quickSearch})`;
      }

      if (this.userSearchFilters && quickSearch) {
        this.azureSearchParams.search = `${this.userSearchFilters} AND ${quickSearch}`;
      } else if (this.userSearchFilters) {
        this.azureSearchParams.search = `${this.userSearchFilters}`;
      } else {
        this.azureSearchParams.search = quickSearch;
      }
    },

    /**
     * Triggered as soon as a parameter of the table has changed (sort, pagination, search)
     */
    async search(params: IAzureSearchParams) {
      this.params = params;

      this.setPaginationParams();

      this.setFilterParams();

      this.setSearchParams();
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const res = await (this as any).fetchData(this.azureSearchParams) as IAzureTableSearchResults;

      if (res) {
        this.itemsCount = res.count;
        this.searchResultIds = res.ids;
        this.searchExecutionDate = res.date;
      }

      this.setState();
    },

    setState() {
      if (!this.saveState) {
        return;
      }

      const uiStateKey = this.getTableName() + this.route;
      this.$storage.uiState.mutations.setSearchTableState(uiStateKey, _cloneDeep({
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
      let state = this.$storage.uiState.getters.getSearchTableState(uiStateKey) as any;
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
    async onApplyFilter({ preparedFilters, searchFilters }: {preparedFilters: Record<string, unknown>; searchFilters?: string}, filterState?: any) {
      this.forceSkip = true;
      this.options.page = 1;
      this.userFilters = _isEmpty(preparedFilters) ? null : preparedFilters;
      this.userSearchFilters = searchFilters;
      this.filterState = filterState;
      await this.search(this.params);
      this.forceSkip = false;
    },

    getTableName() {
      return '';
    },
  },
});
