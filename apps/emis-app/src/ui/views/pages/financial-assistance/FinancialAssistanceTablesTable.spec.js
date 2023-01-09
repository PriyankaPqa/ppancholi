import { RcDataTable } from '@libs/component-lib/components';
import { EFilterType } from '@libs/component-lib/types';
import helpers from '@/ui/helpers/helpers';
import { createLocalVue, mount } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import { mockCombinedFinancialAssistances } from '@libs/entities-lib/financial-assistance';
import { mockCombinedPrograms, mockProgramEntities } from '@libs/entities-lib/program';
import routes from '@/constants/routes';
import { Status } from '@libs/entities-lib/base';
import { getPiniaForUser } from '@/pinia/user/user.mock';
import Component from './FinancialAssistanceTablesTable.vue';

const storage = mockStorage();
const localVue = createLocalVue();

describe('FinancialAssistanceTablesTable.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Component, {
      localVue,
      pinia: getPiniaForUser('level6'),
      mocks: {
        $storage: storage,
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
          pinia: getPiniaForUser('level6'),
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

    describe('filters', () => {
      it('should have correct filters', async () => {
        await wrapper.setData({
          programs: mockProgramEntities(),
        });

        const expected = [
          {
            key: `Metadata/ProgramName/Translation/${wrapper.vm.$i18n.locale}`,
            type: EFilterType.MultiSelect,
            label: 'financialAssistance.program',
            items: [{
              value: 'Program A',
              text: 'Program A',
            }, {
              value: 'Program A',
              text: 'Program A',
            }],
          },
          {
            key: `Entity/Name/Translation/${wrapper.vm.$i18n.locale}`,
            type: EFilterType.Text,
            label: 'common.name',
          },
          {
            key: `Metadata/FinancialAssistanceTableStatusName/Translation/${wrapper.vm.$i18n.locale}`,
            type: EFilterType.MultiSelect,
            label: 'common.status',
            items: helpers.enumToTranslatedCollection(Status, 'enums.Status', true),
          },
        ];
        expect(wrapper.vm.filters).toEqual(expected);
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
          pinia: getPiniaForUser('level6'),
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
          pinia: getPiniaForUser('level6'),
          mocks: {
            $storage: storage,
          },
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

        expect(wrapper.vm.tableProps.loading).toEqual(false);
        expect(wrapper.vm.tableProps.itemClass).toBeDefined();

        wrapper = mount(Component, {
          localVue,
          pinia: getPiniaForUser('level6'),
          mocks: {
            $storage: storage,
          },
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

        expect(wrapper.vm.tableProps.loading).toEqual(true);
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
          pinia: getPiniaForUser('level6'),
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

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should call fetchPrograms', async () => {
        wrapper.vm.fetchPrograms = jest.fn();

        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.fetchPrograms).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Methods', () => {
    describe('fetchData', () => {
      let params;

      beforeEach(() => {
        params = {
          search: 'query',
          top: 10,
          skip: 10,
          orderBy: 'name asc',
        };

        wrapper = mount(Component, {
          localVue,
          pinia: getPiniaForUser('level6'),
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
        }, null, true);
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

    describe('goToEdit', () => {
      it('redirects properly', () => {
        const item = {
          entity: {
            id: 'fa id',
          },
        };

        jest.spyOn(wrapper.vm.$router, 'push').mockImplementation(() => {});

        wrapper.vm.goToEdit(item);

        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.events.financialAssistance.edit.name,
          params: {
            faId: 'fa id',
          },
        });
      });
    });

    describe('getDetailsRoute', () => {
      it('returns correct route', () => {
        const item = {
          entity: {
            id: 'fa id',
          },
        };

        const result = wrapper.vm.getDetailsRoute(item);

        expect(result).toEqual({
          name: routes.events.financialAssistance.details.name,
          params: {
            faId: 'fa id',
          },
        });
      });
    });

    describe('fetchPrograms', () => {
      it('calls search action', async () => {
        wrapper = mount(Component, {
          localVue,
          pinia: getPiniaForUser('level6'),
          mocks: {
            $storage: storage,
          },
        });

        wrapper.vm.combinedProgramStore.search = jest.fn(() => ({
          ids: [mockProgramEntities()[0].id, mockProgramEntities()[1].id],
          count: mockProgramEntities().length,
        }));
        wrapper.vm.combinedProgramStore.getByIds = jest.fn(() => mockCombinedPrograms());
        wrapper.vm.searchResultIds = mockCombinedPrograms().map((e) => e.entity.id);

        await wrapper.setData({
          presetFilter: {
            'Entity/EventId': 'EventId',
          },
        });

        jest.clearAllMocks();

        await wrapper.vm.fetchPrograms();

        expect(wrapper.vm.combinedProgramStore.search).toHaveBeenLastCalledWith({
          filter: {
            'Entity/EventId': 'EventId',
          },
          count: true,
          orderBy: 'Entity/Name/Translation/en',
          queryType: 'full',
          searchMode: 'all',
        }, null, true);
      });
    });
  });
});
