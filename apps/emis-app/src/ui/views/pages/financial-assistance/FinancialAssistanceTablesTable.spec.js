import { RcDataTable } from '@libs/component-lib/components';
import { EFilterKeyType, EFilterType } from '@libs/component-lib/types';
import helpers from '@/ui/helpers/helpers';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { mockProgramEntities } from '@libs/entities-lib/program';
import routes from '@/constants/routes';
import { Status } from '@libs/shared-lib/types';
import { getPiniaForUser } from '@/pinia/user/user.mock';
import { useMockFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance.mock';
import { useMockProgramStore } from '@/pinia/program/program.mock';

import { UserRoles } from '@libs/entities-lib/user';
import Component from './FinancialAssistanceTablesTable.vue';

const localVue = createLocalVue();
const mockFinancialAssistanceTables = [mockFinancialAssistanceTableEntity()];

describe('FinancialAssistanceTablesTable.vue', () => {
  let wrapper;
  const initPiniaForUser = () => {
    const pinia = getPiniaForUser(UserRoles.level6);
    const { financialAssistanceStore } = useMockFinancialAssistanceStore(pinia);
    const { programStore } = useMockProgramStore(pinia);

    return {
      pinia,
      financialAssistanceStore,
      programStore,
    };
  };

  const { pinia, financialAssistanceStore, programStore } = initPiniaForUser(UserRoles.level6);

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        pinia,
        computed: {
          tableData: () => [mockFinancialAssistanceTableEntity()],
        },
      });

      wrapper.vm.count = mockFinancialAssistanceTables.length;
    });
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
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        computed: {
          tableData: () => mockFinancialAssistanceTables,
        },
      });

      wrapper.vm.count = mockFinancialAssistanceTables.length;
    });
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
        const { pinia } = initPiniaForUser(UserRoles.level6);
        wrapper = mount(Component, {
          localVue,
          pinia,
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
            text: 'common.edit',
            class: 'rc-transparent-text',
            value: 'editButton',
            sortable: false,
          },
        ]);
      });
    });

    describe('filters', () => {
      it('should have correct filters', async () => {
        const { pinia } = initPiniaForUser(UserRoles.level6);
        wrapper = mount(Component, {
          localVue,
          pinia,
          computed: {
            programs: () => mockProgramEntities(),
          },
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

    describe('tableProps', () => {
      it('returns the correct object', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
        });
        financialAssistanceStore.searchLoading = false;
        expect(wrapper.vm.tableProps.loading).toEqual(false);
        expect(wrapper.vm.tableProps.itemClass).toBeDefined();

        wrapper = shallowMount(Component, {
          localVue,
          pinia,
        });
        financialAssistanceStore.searchLoading = true;
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
        const { pinia } = initPiniaForUser(UserRoles.level6);
        wrapper = mount(Component, {
          localVue,
          pinia,
          mocks: {
            $route: {
              params: {
                id: 'event id',
              },
            },
          },
        });

        expect(wrapper.vm.eventId).toEqual('event id');
      });
    });
  });

  describe('Lifecycle', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        computed: {
          tableData: () => mockFinancialAssistanceTables,
        },
      });

      wrapper.vm.count = mockFinancialAssistanceTables.length;
    });
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
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        computed: {
          tableData: () => mockFinancialAssistanceTables,
        },
      });

      wrapper.vm.count = mockFinancialAssistanceTables.length;
    });
    describe('fetchData', () => {
      let params;

      beforeEach(() => {
        params = {
          top: 10,
          skip: 10,
          orderBy: 'name asc',
          filter: { someFilter: 'value' },
        };

        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          computed: {
            eventId: () => 'event id',
          },
        });
      });

      it('should call the store with proper parameters', async () => {
        financialAssistanceStore.search = jest.fn();
        await wrapper.vm.fetchData(params);
        expect(financialAssistanceStore.search).toHaveBeenCalledWith({ params: {
          filter: {
            'Entity/EventId': { value: 'event id', type: EFilterKeyType.Guid }, someFilter: 'value',
          },
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
        },
        includeInactiveItems: true });
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
          id: 'fa id',
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
          id: 'fa id',
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
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          computed: {
            eventId: () => 'EventId-1',
          },
        });

        programStore.search = jest.fn(() => ({
          ids: [mockProgramEntities()[0].id, mockProgramEntities()[1].id],
          count: mockProgramEntities().length,
        }));

        jest.clearAllMocks();

        await wrapper.vm.fetchPrograms();

        expect(programStore.search).toHaveBeenLastCalledWith({ params: {
          filter: {
            'Entity/EventId': { value: 'EventId-1', type: EFilterKeyType.Guid },
          },
          count: true,
          orderBy: 'Entity/Name/Translation/en',
        },
        includeInactiveItems: true });
      });
    });
  });
});
