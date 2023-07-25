import { RcDataTable } from '@libs/component-lib/components';
import { EFilterType } from '@libs/component-lib/types/FilterTypes';
import { createLocalVue, mount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { ITEM_ROOT } from '@libs/services-lib/odata-query/odata-query';
import { CaseFileStatus, CaseFileTriage, mockCombinedCaseFile, mockCombinedCaseFiles } from '@libs/entities-lib/case-file';
import helpers from '@/ui/helpers/helpers';
import { createTestingPinia } from '@pinia/testing';
import { useUserStore } from '@/pinia/user/user';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import Component from './CaseFilesTable.vue';

const mockCaseFiles = mockCombinedCaseFiles();
const { caseFileStore, pinia } = useMockCaseFileStore(createTestingPinia({ stubActions: false }));

const localVue = createLocalVue();

describe('CaseFilesTable.vue', () => {
  let wrapper;
  let userStore;
  const mockParams = {
    id: 'test-id',
  };

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        pinia,
        computed: {
          tableData: () => mockCombinedCaseFiles(),
        },
      });

      wrapper.vm.combinedCaseFileStore.getByIds = jest.fn(() => mockCaseFiles);

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
        it('shou;d be hidden', async () => {
          wrapper.vm.helpLink = 'mock-help-data-url';
          await wrapper.vm.$nextTick();
          expect(dataTable.props('showHelp'))
            .toBe(false);
          expect(dataTable.props('helpLink'))
            .toEqual('mock-help-data-url');
        });
      });
    });

    describe('table elements', () => {
      test('case file number redirects to getCaseFileRoute', () => {
        const link = wrapper.findDataTest('caseFileDetail-link_000000111-000001');
        expect(link.props('to'))
          .toEqual({
            name: routes.caseFile.activity.name,
            params: mockParams,
          });
      });

      test('name redirects to getHouseholdProfileRoute', () => {
        const link = wrapper.findDataTest('beneficiaryName-link_Ben 2 Test');
        expect(link.props('to'))
          .toEqual({
            name: routes.household.householdProfile.name,
            params: mockParams,
          });
      });
    });

    describe('isDuplicate', () => {
      it('renders the filter if the feature flag is on', () => {
        wrapper = mount(Component, {
          localVue,
          pinia: createTestingPinia({ stubActions: false }),
          computed: {
            tableData: () => mockCombinedCaseFiles(),
          },
          mocks: {
            $hasFeature: (f) => f === FeatureKeys.ManageDuplicates,
          },
        });

        const toggle = wrapper.findDataTest('caseFilesTable__duplicatesOnlySwitch');
        expect(toggle.exists()).toBeTruthy();
      });

      it('does not render the filter if the feature flag is on', () => {
        wrapper = mount(Component, {
          localVue,
          pinia: createTestingPinia({ stubActions: false }),
          computed: {
            tableData: () => mockCombinedCaseFiles(),
          },
          mocks: {
            $hasFeature: (f) => f !== FeatureKeys.ManageDuplicates,
          },
        });

        const toggle = wrapper.findDataTest('caseFilesTable__duplicatesOnlySwitch');
        expect(toggle.exists()).toBeFalsy();
      });
    });
  });

  describe('Watch', () => {
    beforeEach(async () => {
      wrapper = mount(Component, {
        localVue,
        pinia: createTestingPinia({ stubActions: false }),
      });
      await wrapper.setData({
        myCaseFiles: false,
        duplicatesOnly: false,
      });
    });

    describe('myCaseFiles', () => {
      it('should call applyCustomFilter with the right arguments', async () => {
        wrapper.vm.applyCustomFilter = jest.fn();
        await wrapper.setData({
          myCaseFiles: true,
        });

        expect(wrapper.vm.applyCustomFilter).toHaveBeenCalledWith(true, wrapper.vm.myCaseFilesFilter);
      });
    });

    describe('duplicatesOnly', () => {
      it('should call applyCustomFilter with the right arguments', async () => {
        wrapper.vm.applyCustomFilter = jest.fn();
        await wrapper.setData({
          duplicatesOnly: true,
        });

        expect(wrapper.vm.applyCustomFilter).toHaveBeenCalledWith(true, wrapper.vm.duplicatesOnlyFilter);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        pinia: createTestingPinia({ stubActions: false }),
      });
      userStore = useUserStore();
      userStore.getUserId = jest.fn(() => 'mock-id');
    });

    describe('customColumns', () => {
      it('should return the correct column names', () => {
        wrapper = mount(Component, {
          localVue,
          pinia: createTestingPinia({ stubActions: false }),
          computed: {
            locale() {
              return 'en';
            },
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
              AssignedTeamMembers: {
                any: {
                  TeamMembersIds: {
                    any: {
                      [ITEM_ROOT]: wrapper.vm.userId,
                    },
                  },
                },
              },
            },
          });
      });
    });

    describe('headers', () => {
      it('returns the correct headers data', () => {
        wrapper = mount(Component, {
          localVue,
          pinia: createTestingPinia({ stubActions: false }),
          propsData: {
            isDashboard: false,
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
        wrapper = mount(Component, {
          localVue,
          pinia,
          computed: {
            tableData: () => mockCombinedCaseFiles(),
          },
        });
        caseFileStore.searchLoading = false;
        wrapper.vm.search = jest.fn();
        expect(wrapper.vm.tableProps.loading).toEqual(false);
        expect(wrapper.vm.tableProps.itemClass).toBeDefined();
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
            key: 'Metadata/PrimaryBeneficiary/IdentitySet/LastName',
            type: EFilterType.Text,
            label: 'caseFilesTable.tableHeaders.lastName',
          },
          {
            key: 'Entity/EventId',
            type: EFilterType.Select,
            label: 'caseFileTable.filters.eventName',
            items: wrapper.vm.eventsFilter,
            loading: wrapper.vm.eventsFilterLoading,
            disabled: wrapper.vm.eventsFilterDisabled,
            props: {
              'no-data-text': 'common.inputs.start_typing_to_search',
              'search-input': null,
              'no-filter': true,
              'return-object': true,
              placeholder: 'common.filters.autocomplete.placeholder',
            },
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
            key: 'Entity/AssignedTeamMembers',
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

      it('should have correct filters when feature flag is on', () => {
        wrapper = mount(Component, {
          localVue,
          pinia: createTestingPinia({ stubActions: false }),
          mocks: {
            $hasFeature: jest.fn((f) => f === FeatureKeys.ManageDuplicates),
          },
        });
        const expected = [
          {
            key: 'Metadata/PrimaryBeneficiary/IdentitySet/FirstName',
            type: EFilterType.Text,
            label: 'caseFilesTable.tableHeaders.firstName',
          },
          {
            key: 'Metadata/PrimaryBeneficiary/IdentitySet/LastName',
            type: EFilterType.Text,
            label: 'caseFilesTable.tableHeaders.lastName',
          },
          {
            key: 'Entity/EventId',
            type: EFilterType.Select,
            label: 'caseFileTable.filters.eventName',
            items: wrapper.vm.eventsFilter,
            loading: wrapper.vm.eventsFilterLoading,
            disabled: wrapper.vm.eventsFilterDisabled,
            props: {
              'no-data-text': 'common.inputs.start_typing_to_search',
              'search-input': null,
              'no-filter': true,
              'return-object': true,
              placeholder: 'common.filters.autocomplete.placeholder',
            },
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
            key: 'Entity/AssignedTeamMembers',
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
    beforeEach(async () => {
      wrapper = mount(Component, {
        localVue,
        pinia: createTestingPinia({ stubActions: false }),
      });

      wrapper.vm.combinedCaseFileStore.search = jest.fn(() => ({
        ids: [mockCaseFiles[0].id, mockCaseFiles[1].id],
        count: 2,
      }));

      await wrapper.setData({
        myCaseFiles: false,
      });
    });

    describe('applyCustomFilter', () => {
      describe('when value is True', () => {
        it('should call onApplyFilter with filters from the panel + filter', async () => {
          wrapper.vm.onApplyFilter = jest.fn();
          const expected = { preparedFilters: { ...wrapper.vm.userFilters, ...wrapper.vm.myCaseFilesFilter }, searchFilters: wrapper.vm.userSearchFilters };

          await wrapper.vm.applyCustomFilter(true, wrapper.vm.myCaseFilesFilter);

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenCalledWith(expected, null);
        });
      });

      describe('when value is False', () => {
        it('should call onApplyFilter with {} if the only filter is the applied filter', async () => {
          wrapper.vm.onApplyFilter = jest.fn();

          await wrapper.vm.applyCustomFilter(false, wrapper.vm.myCaseFilesFilter);

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenLastCalledWith({ preparedFilters: {}, searchFilters: wrapper.vm.userSearchFilters }, null);
        });

        it('should call onApplyFilter with filters from the panel if present', async () => {
          wrapper.vm.onApplyFilter = jest.fn();
          const filterFromPanel = {
            test: {},
          };
          await wrapper.setData({
            userFilters: {
              ...wrapper.vm.myCaseFilesFilter,
              ...filterFromPanel,
            },
          });
          await wrapper.vm.applyCustomFilter(false, wrapper.vm.myCaseFilesFilter);

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenLastCalledWith({ preparedFilters: filterFromPanel, searchFilters: wrapper.vm.userSearchFilters }, null);
        });
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

        expect(wrapper.vm.combinedCaseFileStore.search)
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
          }, { name: 'filterState' });

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenLastCalledWith({
              preparedFilters: { ...preparedFilters, ...wrapper.vm.myCaseFilesFilter },
              searchFilters: null,
            }, { name: 'filterState' });
        });
      });

      describe('when user is using duplicates filter', () => {
        it('should call onApplyFilter with proper filters if filters panel also', async () => {
          wrapper.vm.onApplyFilter = jest.fn();
          await wrapper.setData({
            duplicatesOnly: true,
          });

          const preparedFilters = { test: {} };

          await wrapper.vm.onApplyFilterLocal({
            preparedFilters,
            searchFilters: null,
          }, { name: 'filterState' });

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenLastCalledWith({
              preparedFilters: { ...preparedFilters, ...wrapper.vm.duplicatesOnlyFilter },
              searchFilters: null,
            }, { name: 'filterState' });
        });
      });

      describe('when user is using both duplicates and my cases filter', () => {
        it('should call onApplyFilter with proper filters if filters panel also', async () => {
          wrapper.vm.onApplyFilter = jest.fn();
          await wrapper.setData({
            duplicatesOnly: true,
            myCaseFiles: true,
          });

          const preparedFilters = { test: {} };

          await wrapper.vm.onApplyFilterLocal({
            preparedFilters,
            searchFilters: null,
          }, { name: 'filterState' });

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenLastCalledWith({
              preparedFilters: { ...preparedFilters, ...wrapper.vm.duplicatesOnlyFilter, ...wrapper.vm.myCaseFilesFilter },
              searchFilters: null,
            }, { name: 'filterState' });
        });

        it('should call onApplyFilter with proper filters if no filters from panel', async () => {
          wrapper.vm.onApplyFilter = jest.fn();
          await wrapper.setData({
            duplicatesOnly: true,
            myCaseFiles: true,
          });

          await wrapper.vm.onApplyFilterLocal({
            preparedFilters: null,
            searchFilters: null,
          }, { name: 'filterState' });

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenLastCalledWith({
              preparedFilters: { ...wrapper.vm.duplicatesOnlyFilter, ...wrapper.vm.myCaseFilesFilter },
              searchFilters: null,
            }, { name: 'filterState' });
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
          }, { name: 'filterState' });

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenLastCalledWith({
              preparedFilters,
              searchFilters: null,
            }, { name: 'filterState' });
        });
      });
    });

    describe('onAutoCompleteUpdate', () => {
      it('should update eventFilterQuery', async () => {
        const params = { filterKey: 'Entity/EventId', search: 'event', selectedItem: { text: '', value: '' } };
        await wrapper.vm.onAutoCompleteUpdate(params);
        expect(wrapper.vm.eventFilterQuery).toEqual('event');
      });
    });

    describe('getBeneficiaryName', () => {
      it('should return first name and last name from case file metadata', () => {
        const combinedCaseFile = mockCombinedCaseFile();
        expect(wrapper.vm.getBeneficiaryName(combinedCaseFile)).toEqual('Ben 2 Test');
      });

      it('should return Empty household when Identityset is unavailable ', () => {
        const combinedCaseFile = {
          entity: {},
          metadata: {},
        };
        expect(wrapper.vm.getBeneficiaryName(combinedCaseFile)).toEqual('caseFilesTable.tableContent.empty_household');
      });
    });
  });
});
