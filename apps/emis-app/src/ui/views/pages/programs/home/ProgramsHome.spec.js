import { RcDataTable } from '@libs/component-lib/components';
import { EFilterType } from '@libs/component-lib/types';
import helpers from '@/ui/helpers/helpers';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { mockProgramEntities, mockProgramEntity } from '@libs/entities-lib/program';
import { Status } from '@libs/shared-lib/types';
import { useMockProgramStore } from '@/pinia/program/program.mock';

import Component from './ProgramsHome.vue';

const localVue = createLocalVue();

const { pinia, programStore } = useMockProgramStore();

describe('ProgramsHome.vue', () => {
  let wrapper;
  const mockParams = {
    id: 'test-id',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        pinia,
        propsData: {
          id: 'event-id',
        },
        computed: {
          tableData: () => ([mockProgramEntity({ id: 1 })]),
        },
      });

      wrapper.vm.getProgramDetailsRoute = jest.fn(() => ({
        name: routes.programs.details.name,
        params: mockParams,
      }));
      wrapper.vm.getProgramEditRoute = jest.fn(() => ({
        name: routes.programs.edit.name,
        params: mockParams,
      }));
      wrapper.vm.search = jest.fn();
    });

    describe('data table', () => {
      let dataTable;
      beforeEach(() => {
        dataTable = wrapper.findComponent(RcDataTable);
      });

      it('renders', () => {
        expect(dataTable.exists()).toBeTruthy();
      });

      it('displays the correct header values', () => {
        const headers = wrapper.findAll('th');

        expect(headers.length).toBe(3);

        expect(headers.wrappers[0].find('span').text()).toBe('common.name');
        expect(headers.wrappers[1].find('span').text()).toBe('common.status');
        expect(headers.wrappers[2].find('span').text()).toBe('common.edit');
      });

      describe('help button', () => {
        it('does not display the help button ', () => {
          expect(dataTable.props('showHelp')).toBe(false);
          expect(dataTable.props('helpLink')).toEqual('zendesk.help_link.view_programs_list');
        });
      });
    });

    describe('table elements', () => {
      test('program name redirects to program details', () => {
        const link = wrapper.findDataTest(`programDetail-link-${wrapper.vm.tableData[0].id}`);
        expect(link.props('to')).toEqual({
          name: routes.programs.details.name,
          params: mockParams,
        });
      });

      test('edit button redirects to edit program', () => {
        const link = wrapper.findDataTest('editProgram-link');
        expect(link.props('to')).toEqual({
          name: routes.programs.edit.name,
          params: mockParams,
        });
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          id: 'event-id',
        },
      });
    });

    describe('customColumns', () => {
      it('should return the correct column names', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'event-id',
          },
          computed: {
            locale() {
              return 'en';
            },
          },
        });

        const expectedColumns = {
          name: 'Entity/Name/Translation/en',
          status: 'Metadata/ProgramStatusName/Translation/en',
          edit: 'edit',
        };

        expect(wrapper.vm.customColumns).toEqual(expectedColumns);
      });
    });

    describe('headers', () => {
      it('returns the correct headers data', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            isDashboard: false,
            id: 'event-id',
          },
          computed: {
            customColumns() {
              return {
                name: 'Entity/Name/Translation/en',
                status: 'Entity/Status',
                edit: 'edit',
              };
            },
          },
        });

        expect(wrapper.vm.headers).toEqual([
          {
            text: 'common.name',
            sortable: true,
            value: 'Entity/Name/Translation/en',
            width: '100%',
          },
          {
            text: 'common.status',
            sortable: true,
            value: 'Entity/Status',
            width: '100px',
          },
          {
            text: 'common.edit',
            class: 'rc-transparent-text',
            sortable: false,
            value: 'edit',
          },
        ]);
      });
    });

    describe('labels', () => {
      it('returns the right labels', () => {
        expect(wrapper.vm.labels).toEqual({
          header: {
            title: 'programs.title',
            searchPlaceholder: 'common.inputs.quick_search',
            addButtonLabel: 'programs.addProgram',
          },
        });
      });
    });

    describe('tableProps', () => {
      it('returns the correct object', () => {
        expect(wrapper.vm.tableProps.loading).toEqual(programStore.searchLoading);
        expect(wrapper.vm.tableProps.itemClass).toBeDefined();
      });
    });

    describe('tableData', () => {
      it('returns the correct value', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'event-id',
          },
        });

        programStore.getByIdsWithPinnedItems = jest.fn(() => mockProgramEntities());
        wrapper.vm.searchResultIds = mockProgramEntities().map((e) => e.id);

        expect(wrapper.vm.tableData).toEqual(mockProgramEntities());
      });
    });

    describe('filterOptions', () => {
      it('returns the correct value', () => {
        expect(wrapper.vm.filterOptions).toEqual([
          {
            key: 'Entity/Name/Translation/en',
            type: EFilterType.Text,
            label: 'common.name',
          },
          {
            key: 'Metadata/ProgramStatusName/Translation/en',
            type: EFilterType.MultiSelect,
            label: 'common.status',
            items: helpers.enumToTranslatedCollection(Status, 'enums.Status', true),
          },
        ]);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          id: 'event-id',
        },

      });

      programStore.search = jest.fn(() => ({
        ids: [mockProgramEntities()[0].id, mockProgramEntities()[1].id],
        count: mockProgramEntities().length,
      }));
    });

    describe('fetchData', () => {
      let params;

      beforeEach(() => {
        params = {
          search: 'query', filter: {}, top: 10, skip: 10, orderBy: 'name asc',
        };
      });

      it('should call programStore search with proper parameters', async () => {
        await wrapper.vm.fetchData(params);

        expect(programStore.search).toHaveBeenCalledWith({ params: {
          filter: {
            'Entity/EventId': { value: 'event-id', type: 'guid' },
          },
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
        },
        includeInactiveItems: true });
      });
    });

    describe('getProgramDetailsRoute', () => {
      it('returns the right route object', () => {
        expect(wrapper.vm.getProgramDetailsRoute(mockProgramEntities()[0])).toEqual({
          name: routes.programs.details.name,
          params: {
            programId: mockProgramEntities()[0].id,
          },
        });
      });
    });

    describe('getProgramEditRoute', () => {
      it('returns the right route object', () => {
        expect(wrapper.vm.getProgramEditRoute(mockProgramEntities()[0])).toEqual({
          name: routes.programs.edit.name,
          params: {
            programId: mockProgramEntities()[0].id,
          },
        });
      });
    });
  });
});
