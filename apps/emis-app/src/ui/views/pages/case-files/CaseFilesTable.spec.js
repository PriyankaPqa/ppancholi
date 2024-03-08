import { RcDataTable } from '@libs/component-lib/components';
import { EFilterType, EFilterKeyType } from '@libs/component-lib/types/FilterTypes';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { CaseFileStatus, CaseFileTriage, mockCaseFileEntity, mockCaseFileMetadata, mockCombinedCaseFile, mockCombinedCaseFiles } from '@libs/entities-lib/case-file';
import helpers from '@/ui/helpers/helpers';
import { createTestingPinia } from '@pinia/testing';
import { useUserStore } from '@/pinia/user/user';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { useMockHouseholdStore } from '@/pinia/household/household.mock';
import { useMockEventStore } from '@/pinia/event/event.mock';
import { useMockPersonStore } from '@/pinia/person/person.mock';
import { mockHouseholdEntity } from '@libs/entities-lib/household';
import { mockMember } from '@libs/entities-lib/value-objects/member';
import flushPromises from 'flush-promises';
import Component from './CaseFilesTable.vue';

const mockCaseFiles = mockCombinedCaseFiles();
const { caseFileStore, pinia, caseFileMetadataStore } = useMockCaseFileStore(createTestingPinia({ stubActions: false }));
const householdStore = useMockHouseholdStore(pinia).householdStore;
const personStore = useMockPersonStore(pinia).personStore;
const eventStore = useMockEventStore(pinia).eventStore;

const mockHouseholds = [
  mockHouseholdEntity({ id: mockCaseFiles[0].entity.householdId }), mockHouseholdEntity({ id: 'empty household', primaryBeneficiary: null }),
];
householdStore.getByIds = jest.fn(() => mockHouseholds);
const mockPersons = [mockMember({ id: mockHouseholdEntity().primaryBeneficiary })];
personStore.getByIds = jest.fn(() => mockPersons);

const mockTableData = mockCombinedCaseFiles().map((x) => ({ ...x, primaryMemberName: 'some name', eventName: 'event name', recentlyViewed: true }));

const localVue = createLocalVue();

caseFileStore.recentlyViewedCaseFileIds = ['mock-id-1'];

describe('CaseFilesTable.vue', () => {
  let wrapper;
  let userStore;
  const mockParams = {
    id: 'test-id',
  };

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: { show: true },
      mocks: {
        $hasLevel: (lvl) => (lvl <= `level${level}`) && !!level,
        $hasRole: (r) => r === hasRole,
      },
      ...additionalOverwrites,
    });

    await wrapper.vm.$nextTick();
  };

  describe('Template', () => {
    beforeEach(async () => {
      await mountWrapper(true, 6, null, { computed: { tableData: () => mockTableData } });

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
          .toBe(7);

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
        expect(headers.wrappers[6].find('span')
          .text())
          .toBe('caseFilesTable.recentlyViewed');
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
        const link = wrapper.findDataTest('beneficiaryName-link_some name');
        expect(link.props('to'))
          .toEqual({
            name: routes.household.householdProfile.name,
            params: mockParams,
          });
      });
    });

    describe('isDuplicate', () => {
      it('renders the filter', async () => {
        await mountWrapper();

        const toggle = wrapper.findDataTest('caseFilesTable__duplicatesOnlySwitch');
        expect(toggle.exists()).toBeTruthy();
      });
    });
  });

  describe('Watch', () => {
    beforeEach(async () => {
      await mountWrapper();
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

    describe('recentlyViewed', () => {
      it('should call applyCustomFilter with the right arguments', async () => {
        caseFileStore.recentlyViewedCaseFileIds = ['mock-id-1'];
        wrapper.vm.applyCustomFilter = jest.fn();
        await wrapper.setData({
          recentlyViewedOnly: true,
        });

        expect(wrapper.vm.applyCustomFilter).toHaveBeenCalledWith(true, wrapper.vm.isRecentlyViewedFilter);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(async () => {
      await mountWrapper();
      userStore = useUserStore();
      userStore.getUserId = jest.fn(() => 'mock-id');
    });

    describe('customColumns', () => {
      it('should return the correct column names', () => {
        const expectedColumns = {
          caseFileNumber: 'Entity/CaseFileNumber',
          name: 'Metadata/PrimaryBeneficiary/IdentitySet/FirstName',
          event: 'Metadata/Event/Translation/en',
          triage: 'Metadata/TriageName/Translation/en',
          status: 'Metadata/CaseFileStatusName/Translation/en',
          created: 'Entity/Created',
          recentlyViewed: 'RecentlyViewed',
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
              AssignedTeamMembersAsString: {
                contains: wrapper.vm.userId,
              },
            },
          });
      });
    });

    describe('caseFiles', () => {
      it('calls the getter', async () => {
        jest.clearAllMocks();
        wrapper.vm.combinedCaseFileStore.getByIds = jest.fn(() => [mockCombinedCaseFile({ id: '1' }), mockCombinedCaseFile({ id: '2' })]);
        await wrapper.setData({ searchResultIds: ['some'] });
        const r = wrapper.vm.caseFiles;
        expect(wrapper.vm.combinedCaseFileStore.getByIds).toHaveBeenCalledWith(['some'], { baseDate: null, prependPinnedItems: true });
        expect(JSON.stringify(r)).toEqual(JSON.stringify(wrapper.vm.combinedCaseFileStore.getByIds()));
      });
    });

    describe('households', () => {
      it('calls the getter', async () => {
        expect(wrapper.vm.households).toEqual(householdStore.getByIds());
      });
    });

    describe('persons', () => {
      it('calls the getter', async () => {
        expect(wrapper.vm.persons).toEqual(personStore.getByIds());
      });
    });

    describe('headers', () => {
      it('returns the correct headers data', () => {
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
              value: 'Metadata/Event/Translation/en',
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
            {
              sortable: false,
              text: 'caseFilesTable.recentlyViewed',
              class: 'rc-transparent-text',
              value: 'RecentlyViewed',
              width: '5%',
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
      it('returns the correct object', async () => {
        await mountWrapper();
        caseFileStore.searchLoading = false;
        wrapper.vm.search = jest.fn();
        expect(wrapper.vm.tableProps.loading).toEqual(false);
        expect(wrapper.vm.tableProps.itemClass).toBeDefined();
      });
    });

    describe('filters', () => {
      it('should have correct filters', async () => {
        await mountWrapper();
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
            keyType: EFilterKeyType.Guid,
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
            key: 'Metadata/HasPotentialDuplicates',
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
            key: 'Entity/AssignedTeamMembersAsString',
            type: EFilterType.Select,
            label: 'caseFileTable.filters.isAssigned',
            items: [{
              text: 'common.yes',
              value: 'stringArrayNotEmpty',
            }, {
              text: 'common.no',
              value: 'stringArrayEmpty',
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

    describe('tableData', () => {
      it('should return parsed tableData based on recentlyViewedCaseFileIds', async () => {
        jest.clearAllMocks();
        wrapper.vm.combinedCaseFileStore.getByIds = jest.fn(() => [mockCombinedCaseFile({ id: '1' }), mockCombinedCaseFile({ id: '2' })]);
        caseFileStore.items = [mockCaseFileEntity({ id: '1' }), mockCaseFileEntity({ id: '2' })];
        caseFileMetadataStore.items = [mockCaseFileMetadata({ id: '1' }), mockCaseFileMetadata({ id: '2' })];
        caseFileStore.recentlyViewedCaseFileIds = ['1'];
        await mountWrapper();
        expect(JSON.stringify(wrapper.vm.tableData)).toEqual(JSON.stringify([
          {
            entity: mockCombinedCaseFile({ id: '1' }).entity,
            metadata: {},
            pinned: false,
            recentlyViewed: true,
            primaryMemberName: 'Bob Smith',
            eventName: 'Gatineau Floods 2021',
          },
          {
            entity: mockCombinedCaseFile({ id: '2' }).entity,
            metadata: {},
            pinned: false,
            recentlyViewed: false,
            primaryMemberName: 'Bob Smith',
            eventName: 'Gatineau Floods 2021',
          },
        ]));
      });
    });

    describe('isRecentlyViewedFilter', () => {
      beforeEach(async () => {
        await mountWrapper();
      });
      it('should return empty objet when there is no recently viewed case file', async () => {
        caseFileStore.recentlyViewedCaseFileIds = [];
        expect(wrapper.vm.isRecentlyViewedFilter).toEqual({
          Entity: {
            Id: { value: null, type: EFilterKeyType.Guid },
          },
        });
      });

      it('should generate filter object properly', async () => {
        caseFileStore.fetchRecentlyViewed = jest.fn(() => ['mock-id-1', 'mock-id-2']);
        caseFileStore.recentlyViewedCaseFileIds = ['mock-id-1', 'mock-id-2'];
        expect(wrapper.vm.isRecentlyViewedFilter).toEqual({
          or: [
            { Entity: {
              Id: { value: 'mock-id-1', type: EFilterKeyType.Guid },
            },
            },
            { Entity: {
              Id: { value: 'mock-id-2', type: EFilterKeyType.Guid },
            },
            },
          ],
        });
      });
    });
  });

  describe('Methods', () => {
    beforeEach(async () => {
      await mountWrapper();

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
          }, null, false, true);

        expect(eventStore.fetchByIds).toHaveBeenCalledWith(['e70da37e-67cd-4afb-9c36-530c7d8b191f', 'e70da37e-67cd-4afb-9c36-530c7d8b191f'], true);
        expect(householdStore.fetchByIds).toHaveBeenCalledWith(['mock-household-id-1', 'mock-household-id-1'], true);
        expect(personStore.fetchByIds).toHaveBeenCalledWith(['3fa85f64-5717-4562-b3fc-2c963f66afa6'], true);
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

      describe('when user is using is recently viewed filter', () => {
        it('should call onApplyFilter with proper filters if filters panel also, and recentlyViewedCaseFileIds is not empty', async () => {
          wrapper.vm.onApplyFilter = jest.fn();
          caseFileStore.recentlyViewedCaseFileIds = ['mock-id-1'];
          await wrapper.setData({
            recentlyViewedOnly: true,
          });

          const preparedFilters = { test: {} };

          await wrapper.vm.onApplyFilterLocal({
            preparedFilters,
            searchFilters: null,
          }, { name: 'filterState' });

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenLastCalledWith({
              preparedFilters: { ...preparedFilters, ...wrapper.vm.isRecentlyViewedFilter },
              searchFilters: null,
            }, { name: 'filterState' });
        });
      });

      describe('when user is using both duplicates and my cases filter and is recently viewed filter', () => {
        it('should call onApplyFilter with proper filters if filters panel also', async () => {
          wrapper.vm.onApplyFilter = jest.fn();
          await wrapper.setData({
            duplicatesOnly: true,
            myCaseFiles: true,
            recentlyViewedOnly: true,
          });

          const preparedFilters = { test: {} };

          await wrapper.vm.onApplyFilterLocal({
            preparedFilters,
            searchFilters: null,
          }, { name: 'filterState' });

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenLastCalledWith({
              preparedFilters: { ...preparedFilters, ...wrapper.vm.duplicatesOnlyFilter, ...wrapper.vm.myCaseFilesFilter, ...wrapper.vm.isRecentlyViewedFilter },
              searchFilters: null,
            }, { name: 'filterState' });
        });

        it('should call onApplyFilter with proper filters if no filters from panel', async () => {
          wrapper.vm.onApplyFilter = jest.fn();
          await wrapper.setData({
            duplicatesOnly: true,
            myCaseFiles: true,
            recentlyViewedOnly: true,
          });

          await wrapper.vm.onApplyFilterLocal({
            preparedFilters: null,
            searchFilters: null,
          }, { name: 'filterState' });

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenLastCalledWith({
              preparedFilters: { ...wrapper.vm.duplicatesOnlyFilter, ...wrapper.vm.myCaseFilesFilter, ...wrapper.vm.isRecentlyViewedFilter },
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
        expect(wrapper.vm.getBeneficiaryName(combinedCaseFile)).toEqual('Bob Smith');
      });

      it('should return Empty household when Identityset is unavailable ', () => {
        const combinedCaseFile = {
          entity: { householdId: 'empty household' },
          metadata: {},
        };
        expect(wrapper.vm.getBeneficiaryName(combinedCaseFile)).toEqual('caseFilesTable.tableContent.empty_household');
      });
    });
  });

  describe('lifecycle', () => {
    describe('created', () => {
      beforeEach(async () => {
        await mountWrapper();
      });
      it('should set saveState to true and load State, fetchRecentlyViewed', async () => {
        wrapper.vm.loadState = jest.fn();
        caseFileStore.fetchRecentlyViewed = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(wrapper.vm.saveState).toEqual(true);
        expect(wrapper.vm.loadState).toHaveBeenCalled();
        expect(caseFileStore.fetchRecentlyViewed).toHaveBeenCalled();
      });
    });
  });
});
