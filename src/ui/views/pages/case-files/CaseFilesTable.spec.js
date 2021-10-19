import { RcDataTable } from '@crctech/component-library';
import { EFilterType } from '@crctech/component-library/src/types/FilterTypes';
import { createLocalVue, mount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { mockStorage } from '@/store/storage';

import { CaseFileStatus, CaseFileTriage, mockCombinedCaseFiles } from '@/entities/case-file';
import Component from './CaseFilesTable.vue';
import helpers from '@/ui/helpers/helpers';
import { EEventStatus, mockCombinedEvents } from '@/entities/event';

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
        expect(dataTable.exists())
          .toBeTruthy();
      });

      it('displays the correct header values', () => {
        const headers = wrapper.findAll('th');

        expect(headers.length)
          .toBe(6);

        expect(headers.wrappers[0].find('span')
          .text())
          .toBe('caseFileTable.tableHeaders.caseFileNumber');
        expect(headers.wrappers[1].find('span')
          .text())
          .toBe('caseFilesTable.tableHeaders.name');
        expect(headers.wrappers[2].find('span')
          .text())
          .toBe('caseFilesTable.tableHeaders.event');
        expect(headers.wrappers[3].find('span')
          .text())
          .toBe('caseFilesTable.tableHeaders.triage');
        expect(headers.wrappers[4].find('span')
          .text())
          .toBe('caseFilesTable.tableHeaders.status');
        expect(headers.wrappers[5].find('span')
          .text())
          .toBe('caseFilesTable.tableHeaders.createdDate');
      });

      describe('help button', () => {
        it('displays the help button ', async () => {
          wrapper.vm.helpLink = 'mock-help-data-url';
          await wrapper.vm.$nextTick();
          expect(dataTable.props('showHelp'))
            .toBe(true);
          expect(dataTable.props('helpLink'))
            .toEqual('mock-help-data-url');
        });
      });
    });

    describe('table elements', () => {
      test('case file number redirects to getCaseFileRoute', () => {
        const link = wrapper.findDataTest('caseFileDetail-link');
        expect(link.props('to'))
          .toEqual({
            name: routes.caseFile.activity.name,
            params: mockParams,
          });
      });

      test('name redirects to getHouseholdProfileRoute', () => {
        const link = wrapper.findDataTest('beneficiaryName-link');
        expect(link.props('to'))
          .toEqual({
            name: routes.household.householdProfile.name,
            params: mockParams,
          });
      });
    });
  });

  describe('Watch', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
    });
    describe('myCaseFiles', () => {
      describe('On', () => {
        it('should call onApplyFilter with filters from the panel + myCaseFileFilter', async () => {
          wrapper.vm.onApplyFilter = jest.fn();
          const expected = { preparedFilters: { ...wrapper.vm.userFilters, ...wrapper.vm.myCaseFilesFilter } };

          await wrapper.setData({
            myCaseFiles: true,
          });

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenCalledWith(expected);
        });
      });

      describe('Off', () => {
        it('should call onApplyFilter with {} if the only filter is myCaseFileFilter', async () => {
          wrapper.vm.onApplyFilter = jest.fn();

          await wrapper.setData({
            myCaseFiles: true,
          });

          await wrapper.setData({
            myCaseFiles: false,
          });

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenLastCalledWith({ preparedFilters: {} });
        });

        it('should call onApplyFilter with filters from the panel if present', async () => {
          wrapper.vm.onApplyFilter = jest.fn();

          await wrapper.setData({
            myCaseFiles: true,
          });

          const filterFromPanel = {
            test: {},
          };

          await wrapper.setData({
            myCaseFiles: false,
            userFilters: {
              ...wrapper.vm.myCaseFilesFilter,
              ...filterFromPanel,
            },
          });

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenLastCalledWith({ preparedFilters: filterFromPanel });
        });
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      storage.user.getters.userId = jest.fn(() => 'mock-id');
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

    describe('customColumns', () => {
      it('should return the correct column names', () => {
        wrapper = mount(Component, {
          localVue,
          computed: {
            locale() {
              return 'en';
            },
          },
          mocks: {
            $storage: storage,
          },
        });
        const expectedColumns = {
          caseFileNumber: 'Entity/CaseFileNumber',
          name: 'Metadata/PrimaryBeneficiary/IdentitySet/FirstName',
          event: 'Metadata/Event/Name/Translation/en',
          triage: 'Metadata/TriageName/Translation/en',
          status: 'Metadata/CaseFileStatusName/Translation/en',
          created: 'Entity/Created',
        };

        expect(wrapper.vm.customColumns)
          .toEqual(expectedColumns);
      });
    });

    describe('userId', () => {
      it('returns the correct object', () => {
        expect(wrapper.vm.userId)
          .toEqual('mock-id');
      });
    });

    describe('myCaseFilesFilter', () => {
      it('returns the correct object', () => {
        expect(wrapper.vm.myCaseFilesFilter)
          .toEqual({
            Entity: {
              AssignedIndividualIds: {
                any: 'mock-id',
              },
            },
          });
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
                name: 'Metadata/PrimaryBeneficiary/IdentitySet/FirstName',
                event: 'Metadata/Event/Name/Translation/en',
                triage: 'Metadata/TriageName/Translation/en',
                status: 'Metadata/CaseFileStatusName/Translation/en',
                created: 'Entity/Created',
              };
            },
          },
        });

        expect(wrapper.vm.headers)
          .toEqual([
            {
              text: 'caseFileTable.tableHeaders.caseFileNumber',
              sortable: true,
              value: 'Entity/CaseFileNumber',
            },
            {
              text: 'caseFilesTable.tableHeaders.name',
              sortable: true,
              value: 'Metadata/PrimaryBeneficiary/IdentitySet/FirstName',
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
        expect(wrapper.vm.labels)
          .toEqual({
            header: {
              title: `caseFiles_table.title (${mockCaseFiles.length})`,
              searchPlaceholder: 'common.inputs.quick_search',
            },
          });
      });
    });

    describe('tableProps', () => {
      it('returns the correct object', () => {
        expect(wrapper.vm.tableProps)
          .toEqual({
            loading: false,
          });
      });
    });

    describe('filters', () => {
      it('should have correct filters', () => {
        const expected = [
          {
            key: 'Metadata/PrimaryBeneficiary/IdentitySet/FirstName',
            type: EFilterType.Text,
            label: 'caseFilesTable.tableHeaders.firstName',
          },
          {
            key: 'Metadata/PrimaryBeneficiaryLastName',
            type: EFilterType.Text,
            label: 'caseFilesTable.tableHeaders.lastName',
          },
          {
            key: 'Entity/EventId',
            type: EFilterType.Select,
            label: 'caseFileTable.filters.eventName',
            items: wrapper.vm.eventsFilter,
            loading: wrapper.vm.eventsFilterLoading,
            disabled: wrapper.vm.eventsFilterLoading,
          },
          {
            key: `Metadata/TriageName/Translation/${wrapper.vm.$i18n.locale}`,
            type: EFilterType.MultiSelect,
            label: 'caseFileTable.tableHeaders.triage',
            items: helpers.enumToTranslatedCollection(CaseFileTriage, 'enums.Triage', true),
          },
          {
            key: 'Entity/Created',
            type: EFilterType.Date,
            label: 'caseFileTable.filters.createdDate',
          },
          {
            key: `Metadata/CaseFileStatusName/Translation/${wrapper.vm.$i18n.locale}`,
            type: EFilterType.MultiSelect,
            label: 'caseFileTable.tableHeaders.status',
            items: helpers.enumToTranslatedCollection(CaseFileStatus, 'enums.CaseFileStatus', true),
          },
          {
            key: 'Entity/IsDuplicate',
            type: EFilterType.Select,
            label: 'caseFilesTable.filters.isDuplicate',
            items: [{
              text: 'common.yes',
              value: true,
            }, {
              text: 'common.no',
              value: false,
            }],
          },
          {
            key: 'Entity/AssignedIndividualIds',
            type: EFilterType.Select,
            label: 'caseFileTable.filters.isAssigned',
            items: [{
              text: 'common.yes',
              value: 'arrayNotEmpty',
            }, {
              text: 'common.no',
              value: 'arrayEmpty',
            }],
          },
          {
            key: 'Metadata/LastActionDate',
            type: EFilterType.Date,
            label: 'caseFileTable.filters.lastActionDate',
          },
        ];

        expect(wrapper.vm.filters).toEqual(expected);
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
          search: 'query',
          filter: 'filter',
          top: 10,
          skip: 10,
          orderBy: 'name asc',
        };
      });

      it('should call storage actions with proper parameters', async () => {
        await wrapper.vm.fetchData(params);

        expect(wrapper.vm.$storage.caseFile.actions.search)
          .toHaveBeenCalledWith({
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

    describe('getHouseholdProfileRoute', () => {
      it('returns the right route object', () => {
        expect(wrapper.vm.getHouseholdProfileRoute(mockCaseFiles[0]))
          .toEqual({
            name: routes.household.householdProfile.name,
            params: {
              id: mockCaseFiles[0].entity.householdId,
            },
          });
      });
    });

    describe('getCaseFileRoute', () => {
      it('returns the right route object', () => {
        expect(wrapper.vm.getCaseFileRoute(mockCaseFiles[0]))
          .toEqual({
            name: routes.caseFile.activity.name,
            params: {
              id: mockCaseFiles[0].entity.id,
            },
          });
      });
    });

    describe('fetchEventsFilter', () => {
      it('should search user events with status onhold or open filtered by inputed name', async () => {
        await wrapper.vm.fetchEventsFilter();

        expect(wrapper.vm.$services.events.search)
          .toHaveBeenCalledWith({
            filter: {
              or: [
                {
                  Entity: {
                    Schedule: {
                      Status: EEventStatus.Open,
                    },
                  },
                },
                {
                  Entity: {
                    Schedule: {
                      Status: EEventStatus.OnHold,
                    },
                  },
                },
              ],
            },
            select: ['Entity/Name', 'Entity/Id'],
            top: 999,
            orderBy: 'Entity/Name/Translation/en asc',
            queryType: 'full',
            searchMode: 'all',
          });
      });

      it('should set eventsFilter the search results', async () => {
        wrapper.vm.$services.events.search = jest.fn(() => ({
          odataCount: mockCombinedEvents().length,
          odataContext: 'odataContext',
          value: mockCombinedEvents(),
        }));

        await wrapper.vm.fetchEventsFilter();

        const expected = mockCombinedEvents().map((e) => ({
          text: wrapper.vm.$m(e.entity.name),
          value: e.entity.id,
        }));

        expect(wrapper.vm.eventsFilter).toEqual(expected);
      });
    });

    describe('onApplyFilterLocal', () => {
      describe('when user is using my case file filter', () => {
        it('should call onApplyFilter with proper filters if filters panel also', async () => {
          wrapper.vm.onApplyFilter = jest.fn();
          await wrapper.setData({
            myCaseFiles: true,
          });

          const preparedFilters = { test: {} };

          await wrapper.vm.onApplyFilterLocal({
            preparedFilters,
            searchFilters: null,
          });

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenLastCalledWith({
              preparedFilters: { ...preparedFilters, ...wrapper.vm.myCaseFilesFilter },
              searchFilters: null,
            });
        });
      });

      describe('when user is not using my case file filter', () => {
        it('should call onApplyFilter with proper filters', async () => {
          wrapper.vm.onApplyFilter = jest.fn();
          await wrapper.setData({
            myCaseFiles: false,
          });

          const preparedFilters = { test: {} };

          await wrapper.vm.onApplyFilterLocal({
            preparedFilters,
            searchFilters: null,
          });

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenLastCalledWith({
              preparedFilters,
              searchFilters: null,
            });
        });
      });
    });
  });
});
