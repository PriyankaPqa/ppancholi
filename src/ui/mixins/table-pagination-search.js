export default {
  data() {
    return {
      azureSearchItems: [],
      azureSearchCount: 0,
      azureSearchParams: {
        skip: 0,
        top: 0,
        orderBy: '',
        filter: {},
      },
    };
  },
  methods: {
    buildPaginationParams(params) {
      const {
        descending,
        orderBy,
        pageIndex,
        pageSize,
      } = params;

      const direction = descending ? 'desc' : 'asc';
      const skip = (pageIndex - 1) * pageSize;
      const top = pageSize;

      this.azureSearchParams.skip = skip;
      this.azureSearchParams.top = top;
      if (orderBy) {
        this.azureSearchParams.orderBy = `${orderBy} ${direction}`;
      }
    },

    async search(params) {
      this.buildPaginationParams(params);

      this.azureSearchParams.filter = params.search ? this.getFilterParams(params) : {};

      const res = await this.fetchData(this.azureSearchParams);

      if (res) {
        this.azureSearchItems = res?.value;
        this.azureSearchCount = res['@odataCount'];
      }
    },
  },
};
