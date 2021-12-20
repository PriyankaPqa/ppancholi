/**
 * @group ui/mixins
 */

import { createLocalVue, shallowMount } from '@/test/testSetup';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';

const params = {
  pageIndex: 2,
  pageSize: 10,
  search: '',
  orderBy: 'name',
  descending: true,
};

const Component = {
  render() {},
  mixins: [TablePaginationSearchMixin],
  data() {
    return {
      params,
    };
  },
  methods: {
    fetchData: jest.fn(),
    getSearchParams: jest.fn(),
  },
};

const localVue = createLocalVue();
let wrapper;

describe('tablePaginationSearch.vue', () => {
  describe('Data', () => {
    wrapper = shallowMount(Component, {
      localVue,
    });

    test('searchResultIds', () => {
      expect(wrapper.vm.searchResultIds).toEqual([]);
    });

    test('itemsCount', () => {
      expect(wrapper.vm.itemsCount).toEqual(0);
    });

    test('azureSearchParams', () => {
      expect(wrapper.vm.azureSearchParams).toEqual({
        search: '',
        skip: 0,
        top: 0,
        orderBy: '',
        filter: {},
      });
    });

    test('previousPageIndex', () => {
      expect(wrapper.vm.previousPageIndex).toEqual(0);
    });
  });

  describe('Computed properties', () => {
    describe('getTop', () => {
      it('returns the page size', () => {
        expect(wrapper.vm.getTop).toBe(params.pageSize);
      });
    });

    describe('getSkip', () => {
      it('returns skip when pageIndex has changed and no search', () => {
        const skip = (params.pageIndex - 1) * params.pageSize;
        expect(wrapper.vm.isNewPageIndex).toBeTruthy();
        expect(wrapper.vm.getSkip).toEqual(skip);
      });

      it('returns skip when pageIndex has changed with a search', () => {
        wrapper.setData({
          params: { ...params, search: 'query' },
        });
        const skip = (params.pageIndex - 1) * params.pageSize;
        expect(wrapper.vm.isNewPageIndex).toBeTruthy();
        expect(wrapper.vm.getSkip).toEqual(skip);
      });

      it('returns skip when pageIndex has not changed and no search', () => {
        wrapper.setData({
          previousPageIndex: params.pageIndex,
          params: { ...params, search: '' },
        });
        const skip = (params.pageIndex - 1) * params.pageSize;
        expect(wrapper.vm.isNewPageIndex).toBeFalsy();
        expect(wrapper.vm.getSkip).toEqual(skip);
      });

      it('returns 0 when pageIndex has not changed but a search is ongoing', () => {
        wrapper.setData({
          previousPageIndex: params.pageIndex,
          params: { ...params, search: 'query' },
        });
        expect(wrapper.vm.isNewPageIndex).toBeFalsy();
        expect(wrapper.vm.getSkip).toEqual(0);
      });

      it('returns 0 when pageIndex has not changed but forceSkip is true', () => {
        wrapper.setData({
          previousPageIndex: params.pageIndex,
          params: { ...params, search: '' },
          forceSkip: true,
        });
        expect(wrapper.vm.isNewPageIndex).toBeFalsy();
        expect(wrapper.vm.getSkip).toEqual(0);
      });
    });

    describe('getOrderBy', () => {
      it('returns correct orderBy when descending is true', () => {
        expect(wrapper.vm.getOrderBy).toBe('name desc');
      });

      it('returns correct orderBy when descending is false', () => {
        wrapper.setData({
          params: { descending: false },
        });
        expect(wrapper.vm.getOrderBy).toBe('name asc');
      });
    });

    describe('isNewPageIndex', () => {
      it('returns true if the current index is different than the previous one', () => {
        wrapper.setData({
          previousPageIndex: 10,
        });
        expect(wrapper.vm.isNewPageIndex).toBeTruthy();
      });

      it('returns false if the current index is equals to the previous one', () => {
        wrapper.setData({
          previousPageIndex: 0,
          params: { ...params, pageIndex: 0 },
        });
        expect(wrapper.vm.isNewPageIndex).toBeFalsy();
      });
    });
  });

  describe('Methods', () => {
    describe('setPaginationParams', () => {
      it('sets skip parameter', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            getSkip() {
              return 'skip';
            },
          },
        });

        wrapper.vm.setPaginationParams();

        expect(wrapper.vm.azureSearchParams.skip).toEqual('skip');
      });

      it('sets top parameter', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            getTop() {
              return 'top';
            },
          },
        });

        wrapper.vm.setPaginationParams();

        expect(wrapper.vm.azureSearchParams.top).toEqual('top');
      });

      it('sets previousPageIndex', () => {
        wrapper.vm.setPaginationParams();
        expect(wrapper.vm.previousPageIndex).toEqual(params.pageIndex);
      });

      it('sets orderBy previousPageIndex', () => {
        wrapper.vm.setPaginationParams();
        expect(wrapper.vm.azureSearchParams.orderBy).toEqual('name asc');
      });
    });

    describe('setFilterParams', () => {
      it('sets azureSearchParams.filter with userFilters', async () => {
        await wrapper.setData({
          userFilters: [{ filter: 'filter' }],
        });

        wrapper.vm.setFilterParams();

        expect(wrapper.vm.azureSearchParams.filter).toEqual({
          and: [{ filter: 'filter' }],
        });
      });
    });

    describe('setSearchParams', () => {
      it('sets azureSearchParams.search with userSearchFilters', () => {
        wrapper.vm.userSearchFilters = 'test';

        wrapper.vm.setSearchParams();

        expect(wrapper.vm.azureSearchParams.search).toEqual('test');
      });

      it('sets azureSearchParams.search with userSearchFilters and quickSearch', () => {
        wrapper.vm.userSearchFilters = 'filter';
        wrapper.vm.params.search = 'search';

        wrapper.vm.setSearchParams();

        expect(wrapper.vm.azureSearchParams.search).toEqual('filter AND ((/.*search.*/ OR "\\"search\\""))');
      });

      it('sets azureSearchParams.search with sanitized quickSearch', () => {
        wrapper.vm.userSearchFilters = '';
        wrapper.vm.params.search = '[search';

        wrapper.vm.setSearchParams();

        expect(wrapper.vm.azureSearchParams.search).toEqual('((/.*%5C%5Bsearch.*/ OR "\\"%5C%5Bsearch\\""))');
      });

      it('sets azureSearchParams.search with quickSearch split by space', () => {
        wrapper.vm.userSearchFilters = '';
        wrapper.vm.params.search = 'search test';

        wrapper.vm.setSearchParams();

        expect(wrapper.vm.azureSearchParams.search).toEqual('((/.*search.*/ OR "\\"search\\"") AND (/.*test.*/ OR "\\"test\\""))');
      });
    });

    describe('search', () => {
      it('sets this.params', async () => {
        await wrapper.vm.search(params);
        expect(wrapper.vm.params).toEqual(params);
      });

      it('calls setPaginationParams', async () => {
        jest.spyOn(wrapper.vm, 'setPaginationParams');
        await wrapper.vm.search(params);
        expect(wrapper.vm.setPaginationParams).toBeCalled();
      });

      it('calls setFilterParams', async () => {
        jest.spyOn(wrapper.vm, 'setFilterParams');
        await wrapper.vm.search(params);
        expect(wrapper.vm.setFilterParams).toBeCalled();
      });

      it('calls setSearchParams', async () => {
        jest.spyOn(wrapper.vm, 'setSearchParams');
        await wrapper.vm.search(params);
        expect(wrapper.vm.setSearchParams).toBeCalled();
      });

      it('calls fetchData from the component with correct parameters', async () => {
        jest.spyOn(wrapper.vm, 'fetchData');
        await wrapper.vm.search(params);
        expect(wrapper.vm.fetchData).toHaveBeenCalledWith(wrapper.vm.azureSearchParams);
      });

      it('sets searchResultIds with the ids returned', async () => {
        jest.spyOn(wrapper.vm, 'fetchData').mockImplementation(() => ({ ids: [], count: 12 }));
        await wrapper.vm.search(params);
        expect(wrapper.vm.searchResultIds).toEqual([]);
      });

      it('sets the date of the search', async () => {
        jest.spyOn(wrapper.vm, 'fetchData').mockImplementation(() => ({ ids: [], count: 12, date: 'myDate' }));
        await wrapper.vm.search(params);
        expect(wrapper.vm.searchExecutionDate).toEqual('myDate');
      });

      it('sets itemsCount with the count', async () => {
        jest.spyOn(wrapper.vm, 'fetchData').mockImplementation(() => ({ ids: [], count: 12 }));
        await wrapper.vm.search(params);
        expect(wrapper.vm.itemsCount).toEqual(12);
      });
    });

    describe('onApplyFilter', () => {
      it('sets userFilters with preparedFilters', () => {
        const preparedFilters = [{ key: 'name' }];
        const searchFilters = 'search';
        wrapper.vm.onApplyFilter({ preparedFilters, searchFilters });

        expect(wrapper.vm.userFilters).toEqual(preparedFilters);
      });

      it('sets userSearchFilters with searchFilters', () => {
        const preparedFilters = [{ key: 'name' }];
        const searchFilters = 'search';
        wrapper.vm.onApplyFilter({ preparedFilters, searchFilters });

        expect(wrapper.vm.userSearchFilters).toEqual(searchFilters);
      });

      it('calls search method with this.params', () => {
        jest.spyOn(wrapper.vm, 'search').mockImplementation(() => null);
        const preparedFilters = [{ key: 'name' }];
        const searchFilters = 'search';
        wrapper.vm.onApplyFilter({ preparedFilters, searchFilters });

        expect(wrapper.vm.search).toHaveBeenCalledWith(wrapper.vm.params);
      });

      it('forces the page 1 to be displayed', async () => {
        wrapper.vm.options.page = 10;
        await wrapper.vm.onApplyFilter({ preparedFilters: {}, searchFilters: {} });
        expect(wrapper.vm.options.page).toBe(1);
      });
    });
  });
});
