import _cloneDeep from 'lodash/cloneDeep';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { useMockUiStateStore } from '@/pinia/ui-state/uiState.mock';

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

const { pinia, uiStateStore } = useMockUiStateStore();

describe('tablePaginationSearch.vue', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
    });
    wrapper.vm.route = 'current route';
  });

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

    test('searchParams', () => {
      expect(wrapper.vm.searchParams).toEqual({
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

    describe('footerText', () => {
      it('returns the date of last search', () => {
        wrapper.vm.$t = jest.fn(() => 'hello');
        wrapper.setData({
          searchExecutionDate: '2020-01-01',
        });
        expect(wrapper.vm.footerText).toBe('hello');
        expect(wrapper.vm.$t).toHaveBeenCalledWith('searchTable.footer', { date: 'Jan 1, 2020, 12:00 AM' });
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

      it('returns 0 when pageIndex has not changed but a search is ongoing, if forceSkip is not false', () => {
        wrapper.setData({
          previousPageIndex: params.pageIndex,
          params: { ...params, search: 'query' },
          forceSkip: true,
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

        expect(wrapper.vm.searchParams.skip).toEqual('skip');
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

        expect(wrapper.vm.searchParams.top).toEqual('top');
      });

      it('sets previousPageIndex', () => {
        wrapper.vm.setPaginationParams();
        expect(wrapper.vm.previousPageIndex).toEqual(params.pageIndex);
      });

      it('sets orderBy previousPageIndex', () => {
        wrapper.vm.setPaginationParams();
        expect(wrapper.vm.searchParams.orderBy).toEqual('name asc');
      });
    });

    describe('setFilterParams', () => {
      it('sets searchParams.filter with userFilters', async () => {
        await wrapper.setData({
          userFilters: [{ filter: 'filter' }],
        });

        wrapper.vm.setFilterParams();

        expect(wrapper.vm.searchParams.filter).toEqual({
          and: [{ filter: 'filter' }],
        });
      });
    });

    describe('setSearchParams', () => {
      it('if sql mode, the search is applied to metadata/searchabletext when no field specified', () => {
        wrapper.vm.userSearchFilters = '';
        wrapper.vm.params.search = 'search test';

        wrapper.vm.setSearchParams();

        expect(wrapper.vm.searchParams.search).toBeFalsy();
        expect(wrapper.vm.searchParams.filter).toEqual(
          { and: [{}, { and: [{ 'metadata/searchableText': { contains: 'search' } }, { 'metadata/searchableText': { contains: 'test' } }] }] },
        );

        wrapper.vm.searchParams.filter = '';
        wrapper.vm.userSearchFilters = 'filter';

        wrapper.vm.setSearchParams();

        expect(wrapper.vm.searchParams.search).toBeFalsy();
        expect(wrapper.vm.searchParams.filter).toEqual(
          {
            and: [{}, {
              and: [{ 'metadata/searchableText': { contains: 'search' } },
                { 'metadata/searchableText': { contains: 'test' } },
                { 'metadata/searchableText': { contains: 'filter' } }],
            }],
          },
        );
        wrapper.vm.searchParams.filter = { someField: 'value' };
        wrapper.vm.userSearchFilters = 'filter';

        wrapper.vm.setSearchParams();

        expect(wrapper.vm.searchParams.search).toBeFalsy();
        expect(wrapper.vm.searchParams.filter).toEqual(
          {
            and: [{ someField: 'value' }, {
              and: [{ 'metadata/searchableText': { contains: 'search' } },
                { 'metadata/searchableText': { contains: 'test' } },
                { 'metadata/searchableText': { contains: 'filter' } }],
            }],
          },
        );
      });

      it('if sql mode, the search is applied to field specified', () => {
        wrapper.vm.userSearchFilters = '';
        wrapper.vm.params.search = 'search test';
        wrapper.vm.userSearchFilters = 'filter';

        wrapper.vm.quicksearchField = 'myfield';

        wrapper.vm.setSearchParams();

        expect(wrapper.vm.searchParams.search).toBeFalsy();
        expect(wrapper.vm.searchParams.filter).toEqual(
          {
            and: [
              {},
              { and: [
                { myfield: { contains: 'search' } },
                { myfield: { contains: 'test' } },
                { myfield: { contains: 'filter' } },
              ],
              },
            ],
          },
        );
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

      it('calls fetchData from the component with correct parameters - when no additional filter', async () => {
        jest.spyOn(wrapper.vm, 'fetchData');
        await wrapper.vm.search(params);
        expect(wrapper.vm.fetchData).toHaveBeenCalledWith(wrapper.vm.searchParams, true);
      });

      it('calls fetchData from the component with correct parameters - with additional filter', async () => {
        jest.spyOn(wrapper.vm, 'fetchData');
        await wrapper.setData({ userFilters: { entity: 'something' } });
        await wrapper.vm.search(params);
        expect(wrapper.vm.fetchData).toHaveBeenCalledWith(wrapper.vm.searchParams, false);
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

      it('calls setState', async () => {
        jest.spyOn(wrapper.vm, 'setState');
        await wrapper.vm.search(params);
        expect(wrapper.vm.setState).toHaveBeenCalled();
      });

      it('calls onSearchComplete', async () => {
        jest.spyOn(wrapper.vm, 'onSearchComplete');
        await wrapper.vm.search(params);
        expect(wrapper.vm.onSearchComplete).toHaveBeenCalled();
      });
    });

    describe('setState', () => {
      it('calls setSearchTableState when saveState is true', () => {
        wrapper.setData({ saveState: true });
        wrapper.vm.setState();
        expect(uiStateStore.setSearchTableState).toHaveBeenCalledWith(wrapper.vm.route, _cloneDeep({
          searchParams: wrapper.vm.searchParams,
          previousPageIndex: wrapper.vm.previousPageIndex,
          userFilters: wrapper.vm.userFilters,
          userSearchFilters: wrapper.vm.userSearchFilters,
          params: wrapper.vm.params,
          options: wrapper.vm.options,
          searchResultIds: wrapper.vm.searchResultIds,
          itemsCount: wrapper.vm.itemsCount,
          searchExecutionDate: wrapper.vm.searchExecutionDate,
          filterState: wrapper.vm.filterState,
        }));
      });

      it('does not call setSearchTableState when saveState is false', () => {
        wrapper.setData({ saveState: false });
        wrapper.vm.setState();
        expect(uiStateStore.setSearchTableState).not.toHaveBeenCalled();
      });
    });

    describe('loadState', () => {
      it('calls getSearchTableState when saveState is true', () => {
        uiStateStore.getSearchTableState = jest.fn(() => ({
          searchParams: 'searchParams',
          previousPageIndex: 'previousPageIndex',
          userFilters: 'userFilters',
          userSearchFilters: 'userSearchFilters',
          params: 'params',
          options: 'options',
          searchResultIds: 'searchResultIds',
          itemsCount: 'itemsCount',
          searchExecutionDate: 'searchExecutionDate',
          filterState: 'filterState',
        }));
        wrapper.setData({ saveState: true });
        wrapper.vm.loadState();
        expect(uiStateStore.getSearchTableState).toHaveBeenCalledWith(wrapper.vm.route);
        expect(wrapper.vm.searchParams).toEqual('searchParams');
        expect(wrapper.vm.previousPageIndex).toEqual('previousPageIndex');
        expect(wrapper.vm.userFilters).toEqual('userFilters');
        expect(wrapper.vm.userSearchFilters).toEqual('userSearchFilters');
        expect(wrapper.vm.params).toEqual('params');
        expect(wrapper.vm.options).toEqual('options');
        expect(wrapper.vm.searchResultIds).toEqual('searchResultIds');
        expect(wrapper.vm.itemsCount).toEqual('itemsCount');
        expect(wrapper.vm.searchExecutionDate).toEqual('searchExecutionDate');
        expect(wrapper.vm.filterState).toEqual('filterState');
      });

      it('does not call getSearchTableState when saveState is false', () => {
        wrapper.setData({ saveState: false });
        wrapper.vm.loadState();
        expect(uiStateStore.setSearchTableState).not.toHaveBeenCalled();
      });
    });

    describe('onApplyFilter', () => {
      it('sets userFilters with preparedFilters', () => {
        const preparedFilters = [{ key: 'name' }];
        const searchFilters = 'search';
        wrapper.vm.onApplyFilter({ preparedFilters, searchFilters });

        expect(wrapper.vm.userFilters).toEqual(preparedFilters);
      });

      it('sets userFilters with preparedFilters and presetFilters if present', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            presetFilter: () => ({ preset: '1' }),
          },
        });
        const preparedFilters = [{ key: 'name' }];
        const searchFilters = 'search';
        wrapper.vm.onApplyFilter({ preparedFilters, searchFilters });

        expect(wrapper.vm.userFilters).toEqual({ ...preparedFilters, ...wrapper.vm.presetFilter });
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

    describe('onSearchTermInput', () => {
      it('does nothing if the new searchTerm is null', async () => {
        wrapper.vm.debounceSearch = jest.fn();
        await wrapper.vm.onSearchTermInput(null);
        expect(wrapper.vm.debounceSearch).not.toBeCalled();
      });

      it('launches search with the search term and sets pagination to first page if the new searchTerm is not empty string', async () => {
        wrapper.vm.debounceSearch = jest.fn();
        wrapper.vm.goToFirstPage = jest.fn();
        await wrapper.setData({ params: { search: '' } });
        await wrapper.vm.onSearchTermInput('test');

        expect(wrapper.vm.searchTerm).toEqual('test');
        expect(wrapper.vm.goToFirstPage).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.params.search).toEqual('test');
        expect(wrapper.vm.debounceSearch).toBeCalledWith(wrapper.vm.params);
      });
    });

    describe('debounceSearch', () => {
      it('should call fetchEventsFilter', async () => {
        wrapper.vm.search = jest.fn();
        wrapper.vm.debounceSearch();
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 600));
        expect(wrapper.vm.search).toHaveBeenCalledTimes(1);
      });
    });

    describe('goToFirstPage', () => {
      it('resets page in options and params', async () => {
        await wrapper.setData({ params: { pageIndex: 2 }, options: { page: 2 } });
        await wrapper.vm.goToFirstPage();
        expect(wrapper.vm.options.page).toEqual(1);
        expect(wrapper.vm.params.pageIndex).toEqual(1);
      });
    });
  });
});
