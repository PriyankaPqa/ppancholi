import { RcDataTable } from '@crctech/component-library';
import { createLocalVue, mount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { mockStorage } from '@/store/storage';
import { mockUserStateLevel } from '@/test/helpers';

import { mockCombinedCaseFiles } from '@/entities/case-file';
import Component from './CaseFilesTable.vue';

const storage = mockStorage();
const mockCaseFiles = mockCombinedCaseFiles();

const localVue = createLocalVue();

describe('CaseFilesTable.vue', () => {
  let wrapper;
  const mockParams = {
    id: 'test-id',
  };

  storage.caseFile.getters.getByIds = jest.fn(() => mockCaseFiles);

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });

      wrapper.vm.getCaseFileRoute = jest.fn(() => ({
        name: routes.caseFile.activity.name,
        params: mockParams,
      }));

      wrapper.vm.getHouseholdProfileRoute = jest.fn(() => ({
        name: routes.household.householdProfile.name,
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

        expect(headers.length).toBe(6);

        expect(headers.wrappers[0].find('span').text()).toBe('caseFileTable.tableHeaders.caseFileNumber');
        expect(headers.wrappers[1].find('span').text()).toBe('caseFilesTable.tableHeaders.name');
        expect(headers.wrappers[2].find('span').text()).toBe('caseFilesTable.tableHeaders.event');
        expect(headers.wrappers[3].find('span').text()).toBe('caseFilesTable.tableHeaders.triage');
        expect(headers.wrappers[4].find('span').text()).toBe('caseFilesTable.tableHeaders.status');
        expect(headers.wrappers[5].find('span').text()).toBe('caseFilesTable.tableHeaders.createdDate');
      });

      describe('help button', () => {
        it('displays the help button ', async () => {
          wrapper.vm.helpLink = 'mock-help-data-url';
          await wrapper.vm.$nextTick();
          expect(dataTable.props('showHelp')).toBe(true);
          expect(dataTable.props('helpLink')).toEqual('mock-help-data-url');
        });
      });
    });

    describe('table elements', () => {
      test('case file number redirects to getCaseFileRoute', () => {
        const link = wrapper.findDataTest('caseFileDetail-link');
        expect(link.props('to')).toEqual({
          name: routes.caseFile.activity.name,
          params: mockParams,
        });
      });

      test('name redirects to getHouseholdProfileRoute', () => {
        const link = wrapper.findDataTest('beneficiaryName-link');
        expect(link.props('to')).toEqual({
          name: routes.household.householdProfile.name,
          params: mockParams,
        });
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        store: {
          caseFile: {
            searchLoading: false,
          },
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('canViewHousehold', () => {
      it('returns true if user has level 1', () => {
        wrapper = mount(Component, {
          localVue,
          store: {
            ...mockUserStateLevel(1),
            caseFile: {
              searchLoading: false,
            },
          },
          mocks: {
            $storage: {
              caseFile: {
                getters: { getByIds: jest.fn(() => mockCaseFiles) },
                actions: {
                  search: jest.fn(() => ({
                    ids: [mockCaseFiles[0].id, mockCaseFiles[1].id],
                    count: 2,
                  })),
                },
              },
            },
          },
        });

        expect(wrapper.vm.canViewHousehold).toBeTruthy();
      });

      it('returns false if user does not have level 1', () => {
        jest.clearAllMocks();
        wrapper = mount(Component, {
          localVue,
          store: {
            modules: {
              caseFile: {
                searchLoading: false,
              },
              user: {
                state:
                  {
                    oid: '7',
                    email: 'test@test.ca',
                    family_name: 'Joe',
                    given_name: 'Pink',
                    roles: ['contributorIM'],
                  },
              },
            },
          },
          mocks: {
            $storage: {
              caseFile: {
                getters: { getByIds: jest.fn(() => mockCaseFiles) },
                actions: {
                  search: jest.fn(() => ({
                    ids: [mockCaseFiles[0].id, mockCaseFiles[1].id],
                    count: 2,
                  })),
                },
              },
            },
          },
        });

        expect(wrapper.vm.canViewHousehold).toBeFalsy();
      });
    });

    describe('customColumns', () => {
      it('should return the correct column names', () => {
        wrapper = mount(Component, {
          localVue,
          computed: {
            locale() { return 'en'; },
          },
          mocks: {
            $storage: storage,
          },
        });
        const expectedColumns = {
          caseFileNumber: 'Entity/CaseFileNumber',
          name: 'Metadata/PrimaryBeneficiaryFirstName',
          event: 'Metadata/Event/Name/Translation/en',
          triage: 'Metadata/TriageName/Translation/en',
          status: 'Metadata/CaseFileStatusName/Translation/en',
          created: 'Entity/Created',
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
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            customColumns() {
              return {
                caseFileNumber: 'Entity/CaseFileNumber',
                name: 'Metadata/PrimaryBeneficiaryFirstName',
                event: 'Metadata/Event/Name/Translation/en',
                triage: 'Metadata/TriageName/Translation/en',
                status: 'Metadata/CaseFileStatusName/Translation/en',
                created: 'Entity/Created',
              };
            },
          },
        });

        expect(wrapper.vm.headers).toEqual([
          {
            text: 'caseFileTable.tableHeaders.caseFileNumber',
            sortable: true,
            value: 'Entity/CaseFileNumber',
          },
          {
            text: 'caseFilesTable.tableHeaders.name',
            sortable: true,
            value: 'Metadata/PrimaryBeneficiaryFirstName',
          },
          {
            text: 'caseFilesTable.tableHeaders.event',
            sortable: true,
            value: 'Metadata/Event/Name/Translation/en',
          },
          {
            text: 'caseFilesTable.tableHeaders.triage',
            sortable: true,
            value: 'Metadata/TriageName/Translation/en',
          },
          {
            text: 'caseFilesTable.tableHeaders.status',
            sortable: true,
            value: 'Metadata/CaseFileStatusName/Translation/en',
          },
          {
            text: 'caseFilesTable.tableHeaders.createdDate',
            sortable: true,
            value: 'Entity/Created',
          },
        ]);
      });
    });

    describe('labels', () => {
      it('returns the right labels', async () => {
        await wrapper.setData({ itemsCount: mockCaseFiles.length });
        expect(wrapper.vm.labels).toEqual({
          header: {
            title: `caseFiles_table.title (${mockCaseFiles.length})`,
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
      storage.caseFile.actions.search = jest.fn(() => ({
        ids: [mockCaseFiles[0].id, mockCaseFiles[1].id],
        count: 2,
      }));

      wrapper = mount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
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

        expect(wrapper.vm.$storage.caseFile.actions.search).toHaveBeenCalledWith({
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

      it('calls setResults with the search results', async () => {
        jest.spyOn(wrapper.vm, 'setResults').mockImplementation(() => {});
        await wrapper.vm.fetchData(params);
        expect(wrapper.vm.setResults).toHaveBeenCalledWith({
          ids: [mockCaseFiles[0].id, mockCaseFiles[1].id],
          count: 2,
        });
      });
    });

    describe('setResults', () => {
      it('sets the argument data into the write data variables', async () => {
        const searchResult = {
          ids: [mockCaseFiles[0].id, mockCaseFiles[1].id],
          count: 2,
        };
        await wrapper.vm.setResults(searchResult);
        expect(wrapper.vm.itemsCount).toEqual(2);
        expect(wrapper.vm.searchResultIds).toEqual([mockCaseFiles[0].id, mockCaseFiles[1].id]);
      });
    });

    describe('getHouseholdProfileRoute', () => {
      it('returns the right route object', () => {
        expect(wrapper.vm.getHouseholdProfileRoute(mockCaseFiles[0])).toEqual({
          name: routes.household.householdProfile.name,
          params: {
            id: mockCaseFiles[0].entity.householdId,
          },
        });
      });
    });

    describe('getCaseFileRoute', () => {
      it('returns the right route object', () => {
        expect(wrapper.vm.getCaseFileRoute(mockCaseFiles[0])).toEqual({
          name: routes.caseFile.activity.name,
          params: {
            id: mockCaseFiles[0].entity.id,
          },
        });
      });
    });
  });
});
