import _isEmpty from 'lodash/isEmpty';

export default {
  data() {
    return {
      azureSearchItems: [],
      azureSearchCount: 0,
      azureSearchParams: {
        search: '',
        skip: 0,
        top: 0,
        orderBy: '',
        filter: {},
      },
      previousPageIndex: 0,
      userFilters: null,
      userSearchFilters: '',
      params: null,
      forceSkip: false, // when apply or un-apply user filter
      options: {
        page: 1,
      },
    };
  },

  computed: {
    /**
     * Number of item to select
     */
    getTop() {
      return this.params.pageSize;
    },

    /**
     * Calculate the skip to paginated results
     */
    getSkip() {
      const {
        pageIndex,
        pageSize,
        search,
      } = this.params;

      const skip = (pageIndex - 1) * pageSize;

      if (this.isNewPageIndex) {
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
    getOrderBy() {
      const { orderBy, descending } = this.params;
      const direction = descending ? 'desc' : 'asc';
      return `${orderBy} ${direction}`;
    },

    isNewPageIndex() {
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
      let quickSearch;

      if (!this.params.search) {
        quickSearch = '';
      } else {
        quickSearch = `${this.params.search}`; // `${this.params.search}*` for partial search but it's changing results. Ex: <test
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
    async search(params) {
      let newParams = params;

      if (params.search) {
        // We replace space by + so it works with azure search
        newParams = { ...params, search: params.search.replace(/\s/g, '+') };
      }

      this.params = newParams;

      this.setPaginationParams();

      this.setFilterParams();

      this.setSearchParams();

      const res = await this.fetchData(this.azureSearchParams);

      if (res) {
        this.azureSearchItems = res?.value;
        this.azureSearchCount = res.odataCount;
      }
    },

    /**
     * Triggered when a user apply or un-apply a filter
     */
    async onApplyFilter({ preparedFilters, searchFilters }) {
      this.forceSkip = true;
      this.options.page = 1;
      this.userFilters = _isEmpty(preparedFilters) ? null : preparedFilters;
      this.userSearchFilters = searchFilters;
      await this.search(this.params);
      this.forceSkip = false;
    },
  },
};
