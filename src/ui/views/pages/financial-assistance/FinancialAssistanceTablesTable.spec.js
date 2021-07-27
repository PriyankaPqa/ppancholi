import { createLocalVue, mount } from '@/test/testSetup';
import { mockUserStateLevel } from '@/test/helpers';
import { RcDataTable } from '@crctech/component-library';
import { mockStorage } from '@/store/storage';
import { mockCombinedFinancialAssistances } from '@/entities/financial-assistance';
import routes from '@/constants/routes';
import Component from './FinancialAssistanceTablesTable.vue';

const storage = mockStorage();
const localVue = createLocalVue();

describe('FinancialAssistanceTablesTable.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Component, {
      localVue,
      store: {
        ...mockUserStateLevel(6),
      },
      computed: {
        tableData: () => mockCombinedFinancialAssistances(),
      },
    });

    wrapper.vm.searchResultIds = mockCombinedFinancialAssistances().map((item) => item.entity.id);
    wrapper.vm.count = mockCombinedFinancialAssistances().length;
  });

  describe('Template', () => {
    describe('data table', () => {
      let dataTable;
      beforeEach(() => {
        dataTable = wrapper.findComponent(RcDataTable);
      });

      it('renders', () => {
        expect(dataTable.exists()).toBeTruthy();
      });

      it('displays the correct header values when in edit mode', () => {
        const headers = wrapper.findAll('th');

        expect(headers.wrappers[0].find('span').text()).toBe('financialAssistance.program');
        expect(headers.wrappers[1].find('span').text()).toBe('common.name');
        expect(headers.wrappers[2].find('span').text()).toBe('common.status');
      });
    });
  });

  describe('Computed', () => {
    describe('labels', () => {
      it('returns the right labels', () => {
        expect(wrapper.vm.labels).toEqual({
          header: {
            title: 'financialAssistance.table.title.table',
            searchPlaceholder: 'common.inputs.quick_search',
          },
        });
      });
    });

    describe('headers', () => {
      it('returns the correct headers data', () => {
        wrapper = mount(Component, {
          localVue,
          mocks: {
            $storage: storage,
          },
          computed: {
            customColumns() {
              return {
                program: 'Metadata/ProgramName/Translation/En',
                name: 'Entity/Name/Translation/En',
                status: 'Entity/Status',
              };
            },
          },
        });

        expect(wrapper.vm.headers).toEqual([
          {
            text: 'financialAssistance.program',
            align: 'start',
            sortable: true,
            value: 'Metadata/ProgramName/Translation/En',
          },
          {
            text: 'common.name',
            value: 'Entity/Name/Translation/En',
            width: '60%',
            sortable: true,
          },
          {
            text: 'common.status',
            value: 'Entity/Status',
            sortable: true,
          },
          {
            align: 'end',
            text: '',
            value: 'editButton',
            sortable: false,
          },
        ]);
      });
    });

    describe('customColumns', () => {
      it('should return the correct column names', () => {
        const expectedColumns = {
          program: 'Metadata/ProgramName/Translation/en',
          name: 'Entity/Name/Translation/en',
          status: 'Metadata/FinancialAssistanceTableStatusName/Translation/en',
        };

        expect(wrapper.vm.customColumns).toEqual(expectedColumns);
      });
    });

    describe('tableData', () => {
      it('should return the correct values', () => {
        wrapper = mount(Component, {
          localVue,
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.tableData).toEqual(mockCombinedFinancialAssistances());
      });
    });

    describe('tableProps', () => {
      it('returns the correct object', () => {
        wrapper = mount(Component, {
          localVue,
          store: {
            modules: {
              financialAssistanceEntities: {
                state: {
                  searchLoading: false,
                },
              },
            },
          },
        });

        expect(wrapper.vm.tableProps).toEqual({
          loading: false,
        });

        wrapper = mount(Component, {
          localVue,
          store: {
            modules: {
              financialAssistanceEntities: {
                state: {
                  searchLoading: true,
                },
              },
            },
          },
        });

        expect(wrapper.vm.tableProps).toEqual({
          loading: true,
        });
      });
    });

    describe('menuItems', () => {
      it('returns the correct object', () => {
        expect(wrapper.vm.menuItems).toEqual([{
          text: 'financialAssistance.createNewTable',
          value: 'new',
          icon: 'mdi-file',
          dataTest: 'financialAssistanceTables__createNew',
        }]);
      });
    });

    describe('eventId', () => {
      it('returns correct data', () => {
        wrapper = mount(Component, {
          localVue,
          mocks: {
            $route: {
              params: {
                id: 'event id',
              },
            },
            $storage: storage,
          },
        });

        expect(wrapper.vm.eventId).toEqual('event id');
      });
    });
  });

  describe('Methods', () => {
    describe('fetchData', () => {
      let params;

      beforeEach(() => {
        params = {
          search: 'query',
          filter: 'filter',
          top: 10,
          skip: 10,
          orderBy: 'name asc',
        };

        wrapper = mount(Component, {
          localVue,
          mocks: {
            $storage: storage,
          },
          computed: {
            eventId: () => 'event id',
          },
        });
      });

      it('should call storage actions with proper parameters', async () => {
        await wrapper.vm.fetchData(params);

        expect(storage.financialAssistance.actions.search).toHaveBeenCalledWith({
          search: params.search,
          filter: {
            'Entity/EventId': 'event id',
          },
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
          queryType: 'full',
          searchMode: 'all',
        });
      });

      it('calls setResults with the search results', async () => {
        jest.spyOn(wrapper.vm, 'setResults').mockImplementation(() => {});
        await wrapper.vm.fetchData(params);
        expect(wrapper.vm.setResults).toHaveBeenCalledWith({
          ids: ['1'],
          count: 1,
        });
      });
    });

    describe('setResults', () => {
      it('sets the results', () => {
        const response = {
          count: 11,
          ids: ['1', '2'],
        };

        wrapper.vm.setResults(response);

        expect(wrapper.vm.count).toEqual(11);
        expect(wrapper.vm.searchResultIds).toEqual(['1', '2']);
      });
    });

    describe('onClickMenuItem', () => {
      it('redirects properly', () => {
        const item = {
          value: 'new',
        };

        jest.spyOn(wrapper.vm.$router, 'push').mockImplementation(() => {});

        wrapper.vm.onClickMenuItem(item);

        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.events.financialAssistance.create.name });
      });
    });
  });
});
