export default {
  data() {
    return {
      azureSearchItems: [],
      azureSearchCount: 0,
      fetchDataParams: {
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

      this.fetchDataParams.skip = skip;
      this.fetchDataParams.top = top;
      if (orderBy) {
        this.fetchDataParams.orderBy = `${orderBy} ${direction}`;
      }
    },

    async search(params) {
      this.buildPaginationParams(params);

      if (params.search) {
        this.fetchDataParams.filter = this.getFilterParams(params);
      }

      await this.fetchData(this.fetchDataParams);
    },
  },
};
