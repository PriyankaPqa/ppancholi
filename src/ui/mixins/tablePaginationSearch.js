import { toPascalCase } from 'js-convert-case';

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
      previousPageIndex: 0,
    };
  },
  methods: {
    getTop(params) {
      return params.pageSize;
    },

    getSkip(params) {
      const {
        pageIndex,
        pageSize,
        search,
      } = params;

      const skip = (pageIndex - 1) * pageSize;

      if (this.isNewPageIndex(params)) {
        return skip;
      }

      return search && search.length > 0 ? 0 : skip;
    },

    getOrderBy(params) {
      const { orderBy, descending } = params;
      const direction = descending ? 'desc' : 'asc';
      return `${toPascalCase(orderBy)} ${direction}`;
    },

    isNewPageIndex(params) {
      const { pageIndex } = params;
      return this.previousPageIndex !== pageIndex;
    },

    buildPaginationParams(params) {
      const {
        orderBy,
        pageIndex,
      } = params;

      this.azureSearchParams.skip = this.getSkip(params);
      this.azureSearchParams.top = this.getTop(params);
      this.previousPageIndex = pageIndex;

      if (orderBy) {
        this.azureSearchParams.orderBy = this.getOrderBy(params);
      }
    },

    async search(params) {
      this.buildPaginationParams(params);

      this.azureSearchParams.filter = params.search ? this.getFilterParams(params) : {};

      const res = await this.fetchData(this.azureSearchParams);

      if (res) {
        this.azureSearchItems = res?.value;
        this.azureSearchCount = res.odataCount;
      }
    },
  },
};
