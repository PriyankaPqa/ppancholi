import { RcDataTable } from '@libs/component-lib/components';
import { EFilterType } from '@libs/component-lib/types';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import Component from './AssessmentTemplatesHome.vue';

const localVue = createLocalVue();
let storage = mockStorage();

describe('AssessmentTemplatesHome.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: { },
      mocks: {
        $hasLevel: (lvl) => (lvl <= `level${level}`) && !!level,
        $hasRole: (r) => r === hasRole,
        $storage: storage,
      },
      ...additionalOverwrites,
    });

    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
    storage = mockStorage();
    jest.clearAllMocks();
  });

  describe('Template', () => {
    describe('data table', () => {
      let dataTable;
      beforeEach(async () => {
        await mountWrapper(true);
        dataTable = wrapper.findComponent(RcDataTable);
      });

      it('renders', () => {
        expect(dataTable.exists()).toBeTruthy();
      });

      it('displays the correct header values', () => {
        const headers = wrapper.findAll('th');

        expect(headers.length).toBe(4);

        expect(headers.wrappers[0].find('span').text()).toBe('common.name');
        expect(headers.wrappers[1].find('span').text()).toBe('assessmentTemplate.published');
        expect(headers.wrappers[2].find('span').text()).toBe('common.status');
        expect(headers.wrappers[3].find('span').text()).toBe('');
      });

      it('displays the correct row', async () => {
        const tds = wrapper.findAll('td');

        expect(tds.wrappers[0].text()).toBe('Assessment Floods 2021');
        expect(tds.wrappers[1].text()).toBe('-');
        expect(tds.wrappers[2].text()).toBe('enums.Status.Active');
      });
    });
  });

  describe('Computed', () => {
    describe('tableData', () => {
      it('should call getById', async () => {
        await mountWrapper();
        await wrapper.setData({ searchResultIds: ['abc'] });
        const data = wrapper.vm.tableData;
        expect(storage.assessmentTemplate.getters.getByIds).toHaveBeenCalledWith(['abc'],
          {
            baseDate: null, prependPinnedItems: true,
          });
        expect(data.length).toBe(storage.assessmentTemplate.getters.getByIds().length);
      });
    });

    describe('filters', () => {
      it('returns correct value', async () => {
        await mountWrapper();
        expect(wrapper.vm.filters).toEqual([{
          key: 'Entity/Name/Translation/en',
          type: EFilterType.Text,
          label: 'common.name',
        },
        {
          key: 'Metadata/AssessmentTemplateStatusName/Translation/en',
          items: [
            {
              text: 'Active',
              value: 'Active',
            },
            {
              text: 'Inactive',
              value: 'Inactive',
            },
          ],
          type: EFilterType.MultiSelect,
          label: 'common.status',
        }]);
      });
    });
  });

  describe('Methods', () => {
    describe('fetchData', () => {
      let params;

      beforeEach(() => {
        params = {
          search: 'query', filter: { MyFilter: 'zzz' }, top: 10, skip: 10, orderBy: 'name asc',
        };
      });

      it('should call storage actions with proper parameters', async () => {
        await mountWrapper();
        await wrapper.vm.fetchData(params);

        expect(wrapper.vm.$storage.assessmentTemplate.actions.search).toHaveBeenCalledWith({
          search: params.search,
          filter: { MyFilter: 'zzz' },
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
          queryType: 'full',
          searchMode: 'all',
        }, null, true);
      });
    });
  });
});
