import { createLocalVue, mount } from '@/test/testSetup';
import { RcDataTable } from '@crctech/component-library';
import routes from '@/constants/routes';
import { mockStorage } from '@/store/storage';
import { mockProgramsSearchData, Program } from '@/entities/program';
import Component from './ProgramsHome.vue';

const mockPrograms = () => mockProgramsSearchData().map((ev) => new Program(ev));

const localVue = createLocalVue();

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
        propsData: {
          id: 'event-id',
        },
      });

      wrapper.vm.azureSearchItems = mockPrograms();
      wrapper.vm.azureSearchCount = mockPrograms().length;

      wrapper.vm.getProgramDetailsRoute = jest.fn(() => ({
        name: routes.programs.details.name,
        params: mockParams,
      }));

      wrapper.vm.getProgramEditRoute = jest.fn(() => ({
        name: routes.programs.edit.name,
        params: mockParams,
      }));
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
        expect(headers.wrappers[2].find('span').text()).toBe('');
      });

      describe('help button', () => {
        it('displays the help button ', () => {
          expect(dataTable.props('showHelp')).toBe(true);
          expect(dataTable.props('helpLink')).toEqual('zendesk.help_link.view_programs_list');
        });
      });
    });

    describe('table elements', () => {
      test('program name redirects to program details', () => {
        const link = wrapper.findDataTest('programDetail-link');
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
      wrapper = mount(Component, {
        localVue,
        propsData: {
          id: 'event-id',
        },
      });

      wrapper.vm.azureSearchItems = mockPrograms();
      wrapper.vm.azureSearchCount = mockPrograms().length;
    });

    describe('customColumns', () => {
      it('should return the correct column names', () => {
        wrapper = mount(Component, {
          localVue,
          propsData: {
            id: 'event-id',
          },
          computed: {
            locale() { return 'en'; },
          },
        });

        const expectedColumns = {
          name: 'ProgramName/Translation/en',
          status: 'ProgramStatusName/Translation/en',
          edit: 'edit',
        };

        expect(wrapper.vm.customColumns).toEqual(expectedColumns);
      });
    });

    describe('headers', () => {
      it('returns the correct headers data', () => {
        wrapper = mount(Component, {
          localVue,
          propsData: {
            isDashboard: false,
            id: 'event-id',
          },
          computed: {
            customColumns() {
              return {
                name: 'ProgramName/Translation/en',
                status: 'ProgramStatusName/Translation/en',
                edit: 'edit',
              };
            },
          },
        });

        expect(wrapper.vm.headers).toEqual([
          {
            text: 'common.name',
            sortable: true,
            value: 'ProgramName/Translation/en',
            width: '100%',
          },
          {
            text: 'common.status',
            sortable: true,
            value: 'ProgramStatusName/Translation/en',
            width: '100px',
          },
          {
            text: '',
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
          },
        });
      });
    });

    describe('tableProps', () => {
      it('returns the correct object', () => {
        expect(wrapper.vm.tableProps).toEqual({
          loading: false,
        });
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      const storage = mockStorage();

      storage.caseFile.actions.searchCaseFiles = jest.fn(() => ({
        value: mockPrograms(),
        odataContext: '',
        odataCount: mockPrograms().length,
      }));

      wrapper = mount(Component, {
        localVue,
        propsData: {
          id: 'event-id',
        },
        mocks: {
          $storage: storage,
        },
      });

      wrapper.vm.azureSearchItems = mockPrograms();
      wrapper.vm.azureSearchCount = mockPrograms().length;
    });

    describe('fetchData', () => {
      let params;

      beforeEach(() => {
        params = {
          search: 'query', filter: 'filter', top: 10, skip: 10, orderBy: 'name asc',
        };
      });

      it('should call storage actions with proper parameters', async () => {
        await wrapper.vm.fetchData(params);

        expect(wrapper.vm.$storage.program.actions.searchPrograms).toHaveBeenCalledWith({
          search: params.search,
          filter: params.filter,
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
          queryType: 'full',
          searchMode: 'all',
        });
      });
    });

    describe('getProgramDetailsRoute', () => {
      it('returns the right route object', () => {
        expect(wrapper.vm.getProgramDetailsRoute(mockPrograms()[0])).toEqual({
          name: routes.programs.details.name,
          params: {
            programId: mockPrograms()[0].id,
          },
        });
      });
    });

    describe('getProgramEditRoute', () => {
      it('returns the right route object', () => {
        expect(wrapper.vm.getProgramEditRoute(mockPrograms()[0])).toEqual({
          name: routes.programs.edit.name,
          params: {
            programId: mockPrograms()[0].id,
          },
        });
      });
    });
  });
});
