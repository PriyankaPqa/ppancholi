import { createLocalVue, shallowMount } from '@/test/testSetup';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';

const Component = {
  render() {},
  mixins: [TablePaginationSearchMixin],
  methods: {
    fetchData: jest.fn(),
    getFilterParams: jest.fn(),
  },
};

const localVue = createLocalVue();
let wrapper;
const params = {
  pageIndex: 2,
  pageSize: 10,
  search: '',
  orderBy: 'name',
  descending: true,
};

describe('tablePaginationSearch.vue', () => {
  describe('Data', () => {
    wrapper = shallowMount(Component, {
      localVue,
    });

    test('azureSearchItems', () => {
      expect(wrapper.vm.azureSearchItems).toEqual([]);
    });

    test('azureSearchCount', () => {
      expect(wrapper.vm.azureSearchCount).toEqual(0);
    });

    test('azureSearchParams', () => {
      expect(wrapper.vm.azureSearchParams).toEqual({
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

  describe('Methods', () => {
    describe('isNewPageIndex', () => {
      it('returns true if the current index is different than the previous one', () => {
        expect(wrapper.vm.isNewPageIndex(params)).toBeTruthy();
      });

      it('returns false if the current index is equals to the previous one', () => {
        const newParams = { ...params, pageIndex: 0 };
        expect(wrapper.vm.isNewPageIndex(newParams)).toBeFalsy();
      });
    });

    describe('getTop', () => {
      it('returns the page size', () => {
        expect(wrapper.vm.getTop(params)).toBe(params.pageSize);
      });
    });

    describe('getSkip', () => {
      it('returns skip when pageIndex has changed and no search', () => {
        jest.spyOn(wrapper.vm, 'isNewPageIndex').mockImplementation(() => true);
        const skip = (params.pageIndex - 1) * params.pageSize;
        expect(wrapper.vm.getSkip(params)).toEqual(skip);
      });

      it('returns skip when pageIndex has changed with a search', () => {
        jest.spyOn(wrapper.vm, 'isNewPageIndex').mockImplementation(() => true);
        const newParams = { ...params, search: 'query' };
        const skip = (params.pageIndex - 1) * params.pageSize;
        expect(wrapper.vm.getSkip(newParams)).toEqual(skip);
      });

      it('returns skip when pageIndex has not changed and no search', () => {
        jest.spyOn(wrapper.vm, 'isNewPageIndex').mockImplementation(() => false);
        const skip = (params.pageIndex - 1) * params.pageSize;
        expect(wrapper.vm.getSkip(params)).toEqual(skip);
      });

      it('returns 0 when pageIndex has not changed but a search is ongoing', () => {
        jest.spyOn(wrapper.vm, 'isNewPageIndex').mockImplementation(() => false);
        const newParams = { ...params, search: 'query' };
        expect(wrapper.vm.getSkip(newParams)).toEqual(0);
      });
    });

    describe('getOrderBy', () => {
      it('returns correct orderBy when descending is true', () => {
        expect(wrapper.vm.getOrderBy(params)).toBe('name desc');
      });

      it('returns correct orderBy when descending is false', () => {
        const newParams = { ...params, descending: false };
        expect(wrapper.vm.getOrderBy(newParams)).toBe('name asc');
      });
    });

    describe('buildPaginationParams', () => {
      it('sets skip parameter', () => {
        jest.spyOn(wrapper.vm, 'getSkip').mockImplementation(() => 'skip');
        wrapper.vm.buildPaginationParams(params);
        expect(wrapper.vm.azureSearchParams.skip).toEqual('skip');
      });

      it('sets top parameter', () => {
        jest.spyOn(wrapper.vm, 'getTop').mockImplementation(() => 'top');
        wrapper.vm.buildPaginationParams(params);
        expect(wrapper.vm.azureSearchParams.top).toEqual('top');
      });

      it('sets previousPageIndex', () => {
        wrapper.vm.buildPaginationParams(params);
        expect(wrapper.vm.previousPageIndex).toEqual(params.pageIndex);
      });

      it('sets orderBy previousPageIndex', () => {
        wrapper.vm.buildPaginationParams(params);
        expect(wrapper.vm.azureSearchParams.orderBy).toEqual('name desc');
      });
    });

    describe('search', () => {
      it('calls buildPaginationParams with correct parameters', async () => {
        jest.spyOn(wrapper.vm, 'buildPaginationParams');
        await wrapper.vm.search(params);
        expect(wrapper.vm.buildPaginationParams).toHaveBeenCalledWith(params);
      });

      it('calls getFilterParams from the component with correct parameters if search and sets to azureSearchParams.filter', async () => {
        jest.spyOn(wrapper.vm, 'getFilterParams');
        const newParams = { ...params, search: 'query' };
        await wrapper.vm.search(newParams);
        expect(wrapper.vm.getFilterParams).toHaveBeenCalledWith(newParams);
        expect(wrapper.vm.azureSearchParams.filter).toEqual(wrapper.vm.getFilterParams(newParams));
      });

      it('calls fetchData from the component with correct parameters', async () => {
        jest.spyOn(wrapper.vm, 'fetchData');
        await wrapper.vm.search(params);
        expect(wrapper.vm.fetchData).toHaveBeenCalledWith(wrapper.vm.azureSearchParams);
      });

      it('sets azureSearchItems with the results', async () => {
        jest.spyOn(wrapper.vm, 'fetchData').mockImplementation(() => ({ value: 'data', odataCount: 12 }));
        await wrapper.vm.search(params);
        expect(wrapper.vm.azureSearchItems).toEqual('data');
      });

      it('sets azureSearchCount with the count', async () => {
        jest.spyOn(wrapper.vm, 'fetchData').mockImplementation(() => ({ value: 'data', odataCount: 12 }));
        await wrapper.vm.search(params);
        expect(wrapper.vm.azureSearchCount).toEqual(12);
      });
    });
  });
});
