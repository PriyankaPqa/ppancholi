import { RcDataTable } from '@libs/component-lib/components';
import { EFilterType } from '@libs/component-lib/types';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import flushPromises from 'flush-promises';
import {
  mockCaseFinancialAssistanceEntities,
  ApprovalStatus,
  ApprovalAction,
  mockCaseFinancialAssistanceEntity,
} from '@libs/entities-lib/financial-assistance-payment';
import { mockFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { mockCaseFileEntity } from '@libs/entities-lib/case-file';
import routes from '@/constants/routes';
import { EEventStatus, mockEventEntity } from '@libs/entities-lib/event';
import { useMockFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment.mock';
import { useMockFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance.mock';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { DuplicateStatus, mockPotentialDuplicateEntity } from '@libs/entities-lib/potential-duplicate';
import { UserRoles } from '@libs/entities-lib/user';

import { useMockPotentialDuplicateStore } from '@/pinia/potential-duplicate/potential-duplicate.mock';
import Component from './FinancialAssistancePaymentsList.vue';

const localVue = createLocalVue();
const mockEvent = mockEventEntity();
mockEvent.schedule.status = EEventStatus.Open;
const mockCaseFile = mockCaseFileEntity({ id: '1' });

const { pinia, financialAssistancePaymentStore } = useMockFinancialAssistancePaymentStore();
const { caseFileStore } = useMockCaseFileStore(pinia);
const { financialAssistanceStore } = useMockFinancialAssistanceStore(pinia);
financialAssistanceStore.search = jest.fn(() => mockFinancialAssistanceTableEntity());
const potentialDuplicateStore = useMockPotentialDuplicateStore(pinia).potentialDuplicateStore;

describe('FinancialAssistancePaymentsList.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: { id: 'mock-cf-id' },
      computed: {
        event() {
          return mockEvent;
        },
      },
      mocks: {
        $hasLevel: (lvl) => (lvl <= `level${level}`) && !!level,
        $hasRole: (r) => r === hasRole,
      },
      data() {
        return {
          searchResultIds: mockCaseFinancialAssistanceEntities().map((e) => e.id),
        };
      },
      ...additionalOverwrites,
    });
    await flushPromises();
    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
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

        expect(headers.length).toBe(7);

        expect(headers.wrappers[0].find('span').text()).toBe('');
        expect(headers.wrappers[1].find('span').text()).toBe('caseFilesTable.tableHeaders.name');
        expect(headers.wrappers[2].find('span').text()).toBe('caseFilesTable.filters.createdDate');
        expect(headers.wrappers[3].find('span').text()).toBe('caseFile.financialAssistance.totals');
        expect(headers.wrappers[4].find('span').text()).toBe('caseFile.financialAssistance.approvalStatus');
        expect(headers.wrappers[5].find('span').text()).toBe('common.edit');
        expect(headers.wrappers[6].find('span').text()).toBe('common.delete');
      });

      it('displays the correct row', async () => {
        const tds = wrapper.findAll('td');

        expect(tds.wrappers[1].text()).toBe('thl payment');
        expect(tds.wrappers[2].text()).toBe('Apr 6, 2021');
        expect(tds.wrappers[3].text()).toBe('$88.00');
        expect(tds.wrappers[4].text()).toBe('enums.ApprovalStatus.New');
      });

      it('binds show-add to canAdd', async () => {
        await mountWrapper(false, 6, null, {
          computed: {
            canAdd: () => true,
          },
        });
        dataTable = wrapper.findComponent(RcDataTable);
        expect(dataTable.props('showAddButton')).toBeTruthy();

        await mountWrapper(false, 6, null, {
          computed: {
            canAdd: () => false,
          },
        });
        dataTable = wrapper.findComponent(RcDataTable);
        expect(dataTable.props('showAddButton')).toBeFalsy();
      });

      it('should receive correct tableProps', () => {
        dataTable = wrapper.findComponent(RcDataTable);
        expect(JSON.stringify(dataTable.props('tableProps'))).toEqual(JSON.stringify({
          showExpand: true,
          itemKey: 'id',
          expandIcon: 'mdi-menu-down',
          loading: false,
          itemClass: (item) => (item.pinned ? 'pinned' : ''),
        }));
      });
    });

    it('shows edit when item is new and canEdit', async () => {
      await mountWrapper(true, 6, null, {
        computed: {
          canEdit: () => true,
          tableData: () => mockCaseFinancialAssistanceEntities(),
        },
      });

      expect(wrapper.findDataTest('edit-link').exists()).toBeTruthy();

      await mountWrapper(true, 6, null, {
        computed: {
          canEdit: () => true,
          tableData: () => [mockCaseFinancialAssistanceEntity({ approvalStatus: ApprovalStatus.Approved })],
        },
      });

      expect(wrapper.findDataTest('edit-link').exists()).toBeFalsy();

      await mountWrapper(true, 6, null, {
        computed: {
          canEdit: () => false,
          tableData: () => [mockCaseFinancialAssistanceEntity({ approvalStatus: ApprovalStatus.New })],
        },
      });
      expect(wrapper.findDataTest('edit-link').exists()).toBeFalsy();
    });

    it('shows delete when item is new and canDelete', async () => {
      await mountWrapper(true, 6, null, {
        computed: {
          canDelete: () => true,
          tableData: () => mockCaseFinancialAssistanceEntities(),
        },
      });

      expect(wrapper.findDataTest('delete-link').exists()).toBeTruthy();

      await mountWrapper(true, 6, null, {
        computed: {
          canDelete: () => true,
          tableData: () => [mockCaseFinancialAssistanceEntity({ approvalStatus: ApprovalStatus.Approved })],
        },
      });

      expect(wrapper.findDataTest('delete-link').exists()).toBeFalsy();

      await mountWrapper(true, 6, null, {
        computed: {
          canDelete: () => false,
          tableData: () => [mockCaseFinancialAssistanceEntity({ approvalStatus: ApprovalStatus.New })],
        },
      });

      expect(wrapper.findDataTest('delete-link').exists()).toBeFalsy();
    });

    it('shows history when item is canViewHistory is true', async () => {
      await mountWrapper(true, 6, null, {
        computed: {
          tableData: () => [mockCaseFinancialAssistanceEntity({ approvalStatus: ApprovalStatus.Approved, approvalStatusHistory: [{}] })],
        },
      });
      expect(wrapper.findDataTest('history-link').exists()).toBeTruthy();
    });

    it('does not shows history when item is canViewHistory is false', async () => {
      await mountWrapper(true, 6, null, {
        computed: {
          tableData: () => [mockCaseFinancialAssistanceEntity({ approvalStatus: ApprovalStatus.New })],
        },
      });
      expect(wrapper.findDataTest('history-link').exists()).toBeFalsy();
    });
  });

  describe('Computed', () => {
    describe('canAdd', () => {
      it('returns true for level1+ when not readonly', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.canAdd).toBeTruthy();
        await mountWrapper(
          false,
          1,
          null,
          {
            computed: {
              readonly() {
                return true;
              },
            },
          },
        );
        expect(wrapper.vm.canAdd).toBeFalsy();
        await mountWrapper(false, null);
        expect(wrapper.vm.canAdd).toBeFalsy();
        await mountWrapper(false, null, UserRoles.readonly);
        expect(wrapper.vm.canAdd).toBeFalsy();
        await mountWrapper(false, null, UserRoles.contributor3);
        expect(wrapper.vm.canAdd).toBeFalsy();
        await mountWrapper(false, null, UserRoles.contributorFinance);
        expect(wrapper.vm.canAdd).toBeFalsy();
      });
    });

    describe('canEdit', () => {
      it('returns true for level1+ only when not readonly', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.canEdit).toBeTruthy();
        await mountWrapper(
          false,
          1,
          null,
          {
            computed: {
              readonly() {
                return true;
              },
            },
          },
        );
        expect(wrapper.vm.canEdit).toBeFalsy();
        await mountWrapper(false, null);
        expect(wrapper.vm.canEdit).toBeFalsy();
        await mountWrapper(false, null, UserRoles.readonly);
        expect(wrapper.vm.canEdit).toBeFalsy();
        await mountWrapper(false, null, UserRoles.contributor3);
        expect(wrapper.vm.canEdit).toBeFalsy();
        await mountWrapper(false, null, UserRoles.contributorFinance);
        expect(wrapper.vm.canEdit).toBeFalsy();
      });
    });

    describe('canDelete', () => {
      it('returns true for level1+ when not readonly', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.canDelete).toBeTruthy();
        await mountWrapper(
          false,
          1,
          null,
          {
            computed: {
              readonly() {
                return true;
              },
            },
          },
        );
        expect(wrapper.vm.canDelete).toBeFalsy();
        await mountWrapper(false, null);
        expect(wrapper.vm.canDelete).toBeFalsy();
        await mountWrapper(false, null, UserRoles.readonly);
        expect(wrapper.vm.canDelete).toBeFalsy();
        await mountWrapper(false, null, UserRoles.contributor3);
        expect(wrapper.vm.canDelete).toBeFalsy();
        await mountWrapper(false, null, UserRoles.contributorFinance);
        expect(wrapper.vm.canDelete).toBeFalsy();
      });
    });

    describe('tableData', () => {
      it('should call getById', async () => {
        await mountWrapper();
        await wrapper.setData({ searchResultIds: ['abc'] });
        const data = wrapper.vm.tableData;
        expect(financialAssistancePaymentStore.getByIdsWithPinnedItems).toHaveBeenCalledWith(
          ['abc'],
          {
            baseDate: null, onlyActive: true, parentId: { caseFileId: 'mock-cf-id' },
          },
        );
        expect(data.length).toBe(financialAssistancePaymentStore.getByIdsWithPinnedItems().length);
      });
    });

    describe('headers', () => {
      it('depends on canEdit and canDelete', async () => {
        await mountWrapper(false, 6, null, {
          computed: {
            canEdit: () => true,
            canDelete: () => true,
          },
        });
        let { headers } = wrapper.vm;
        expect(headers.length).toBe(6);

        await mountWrapper(false, 6, null, {
          computed: {
            canEdit: () => false,
            canDelete: () => false,
          },
        });
        headers = wrapper.vm.headers;
        expect(headers.length).toBe(4);

        await mountWrapper(false, 6, null, {
          computed: {
            canEdit: () => true,
            canDelete: () => false,
          },
        });
        headers = wrapper.vm.headers;
        expect(headers.length).toBe(5);
      });
    });

    describe('filters', () => {
      it('returns correct value', async () => {
        expect(wrapper.vm.filters).toEqual([{
          key: 'Entity/Name',
          type: EFilterType.Text,
          label: 'common.name',
        },
        {
          key: 'Entity/Created',
          type: EFilterType.Date,
          label: 'caseFilesTable.filters.createdDate',
        }]);
      });
    });

    describe('isDuplicate', () => {
      it('returns true if household has potential duplicates', async () => {
        potentialDuplicateStore.getDuplicates.mockReturnValue([mockPotentialDuplicateEntity({ duplicateStatus: DuplicateStatus.Potential })]);
        await mountWrapper();
        expect(wrapper.vm.isDuplicate).toEqual(true);
      });
      it('returns false if household has no potential duplicates', async () => {
        potentialDuplicateStore.getDuplicates.mockReturnValue([mockPotentialDuplicateEntity({ duplicateStatus: DuplicateStatus.Resolved })]);
        await mountWrapper();
        expect(wrapper.vm.isDuplicate).toEqual(false);
      });

      it('returns falsy if household has  potential duplicates null', async () => {
        potentialDuplicateStore.getDuplicates.mockReturnValue(null);
        await mountWrapper();
        expect(wrapper.vm.isDuplicate).toBeFalsy();
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

      it('should call search with proper param', async () => {
        await mountWrapper();
        await wrapper.vm.fetchData(params);

        expect(financialAssistancePaymentStore.search).toHaveBeenCalledWith({ params: {
          filter: { 'Entity/CaseFileId': { value: wrapper.vm.id, type: 'guid' }, MyFilter: 'zzz' },
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
        },
        includeInactiveItems: false });
      });
    });

    describe('isModifiable', () => {
      it('returns true if approval status is new', async () => {
        await mountWrapper();
        const mock = mockCaseFinancialAssistanceEntity();
        mock.approvalStatus = ApprovalStatus.Approved;
        expect(wrapper.vm.isModifiable(mock)).toBeFalsy();
        mock.approvalStatus = ApprovalStatus.New;
        expect(wrapper.vm.isModifiable(mock)).toBeTruthy();
        mock.approvalStatus = ApprovalStatus.Pending;
        expect(wrapper.vm.isModifiable(mock)).toBeFalsy();
        mock.approvalStatus = ApprovalStatus.Declined;
        expect(wrapper.vm.isModifiable(mock)).toBeFalsy();
      });
    });

    describe('showApprovalDialog', () => {
      it('sets variables for dialog', async () => {
        await mountWrapper();
        expect(wrapper.vm.selectedItem).toBeNull();
        expect(wrapper.vm.showApprovalHistory).toBeFalsy();
        const mock = mockCaseFinancialAssistanceEntity();
        wrapper.vm.showApprovalDialog(mock);
        expect(wrapper.vm.selectedItem).toBe(mock);
        expect(wrapper.vm.showApprovalHistory).toBeTruthy();
      });
    });

    describe('canViewHistory', () => {
      it('checks for all statuses except new', async () => {
        await mountWrapper();
        const mock = mockCaseFinancialAssistanceEntity();
        mock.approvalStatus = ApprovalStatus.New;
        expect(wrapper.vm.canViewHistory(mock)).toBeFalsy();
        mock.approvalStatus = ApprovalStatus.Pending;
        expect(wrapper.vm.canViewHistory(mock)).toBeTruthy();
        mock.approvalStatus = ApprovalStatus.Declined;
        expect(wrapper.vm.canViewHistory(mock)).toBeTruthy();
        mock.approvalStatus = ApprovalStatus.Approved;
        expect(wrapper.vm.canViewHistory(mock)).toBeTruthy();
      });

      it('should return true if approval action is ApprovalAction.RequestAdditionalInfo', async () => {
        await mountWrapper();
        const mock = mockCaseFinancialAssistanceEntity();
        mock.approvalStatus = ApprovalStatus.New;
        mock.approvalAction = ApprovalAction.RequestAdditionalInfo;
        expect(wrapper.vm.canViewHistory(mock)).toBeTruthy();
      });
    });

    describe('getFapDetailsRoute', () => {
      it('returns the detail route', async () => {
        await mountWrapper();
        expect(wrapper.vm.getFapDetailsRoute('abc')).toEqual({
          name: routes.caseFile.financialAssistance.details.name,
          params: {
            financialAssistancePaymentId: 'abc',
          },
        });
      });
    });

    describe('getFapEditRoute', () => {
      it('returns the edit route', async () => {
        await mountWrapper();
        expect(wrapper.vm.getFapEditRoute('abc')).toEqual({
          name: routes.caseFile.financialAssistance.edit.name,
          params: {
            financialAssistancePaymentId: 'abc',
          },
        });
      });
    });

    describe('deletePayment', () => {
      it('calls deactivate after confirmation', async () => {
        const mock = mockCaseFinancialAssistanceEntity();
        await mountWrapper();
        await wrapper.vm.deletePayment(mock);
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({
          title: 'caseFile.financialAssistance.confirm.delete.title',
          messages: 'caseFile.financialAssistance.confirm.delete.message',
        });
        expect(financialAssistancePaymentStore.deactivate)
          .toHaveBeenCalledWith(mock.id);
      });
      it('doesnt call deactivate if no confirmation', async () => {
        const mock = mockCaseFinancialAssistanceEntity();
        await mountWrapper();
        wrapper.vm.$confirm = jest.fn(() => false);
        await wrapper.vm.deletePayment(mock);
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({
          title: 'caseFile.financialAssistance.confirm.delete.title',
          messages: 'caseFile.financialAssistance.confirm.delete.message',
        });
        expect(financialAssistancePaymentStore.deactivate)
          .toHaveBeenCalledTimes(0);
      });
    });

    describe('routeToCreate', () => {
      it('goes to route if active tables exist and has no restrict financial case file tags', async () => {
        await mountWrapper();
        await wrapper.setData({
          containsActiveTables: true,
          hasRestrictFinancialTags: false,
          householdDuplicates: [],
        });
        await wrapper.vm.routeToCreate();
        expect(wrapper.vm.$router.push).toHaveBeenLastCalledWith({ name: routes.caseFile.financialAssistance.create.name });
      });

      it('does not go to route if no active tables exist', async () => {
        await mountWrapper();
        await wrapper.setData({
          containsActiveTables: false,
          hasRestrictFinancialTags: false,
        });
        await wrapper.vm.routeToCreate();
        expect(wrapper.vm.$router.push).not.toHaveBeenCalled();
      });

      it('not goes to route if has restrict financial case file tags', async () => {
        await mountWrapper();
        await wrapper.setData({
          containsActiveTables: true,
          hasRestrictFinancialTags: true,
        });
        await wrapper.vm.routeToCreate();
        expect(wrapper.vm.$router.push).not.toHaveBeenCalled();
      });

      it('does not go to route if  case file is duplicate', async () => {
        await mountWrapper(false, 6, null, { computed: { isDuplicate() {
          return true;
        } } });
        await wrapper.setData({ householdDuplicates: [mockPotentialDuplicateEntity({ duplicateStatus: DuplicateStatus.Potential })] });

        await wrapper.vm.routeToCreate();
        expect(wrapper.vm.$router.push).not.toHaveBeenCalled();
        expect(wrapper.vm.$message).toHaveBeenCalledWith({ title: 'common.error', message: 'caseFile.financialAssistance.error.potentialDuplicate' });
      });

      it('goes to route if active tables exist and the case file is not a duplicate', async () => {
        jest.clearAllMocks();
        await mountWrapper(false, 6, 'role', { computed:
           { isDuplicate() {
             return false;
           } },
        });
        await wrapper.setData({ containsActiveTables: true, hasRestrictFinancialTags: false, householdDuplicates: [mockPotentialDuplicateEntity()] });

        await wrapper.vm.routeToCreate();
        expect(wrapper.vm.$router.push).toHaveBeenLastCalledWith({ name: routes.caseFile.financialAssistance.create.name });
      });

      it('does nothing if  there is no household data', async () => {
        await mountWrapper(false, 6, null, { computed: { isDuplicate() {
          return true;
        } } });
        await wrapper.setData({ householdDuplicates: null });
        await wrapper.vm.routeToCreate();
        expect(wrapper.vm.$router.push).not.toHaveBeenCalled();
      });
    });

    describe('checkHasRestrictFinancialTags', () => {
      it('set hasRestrictFinancialTags to true when case file tag with restrict fiancial exist', async () => {
        await mountWrapper();
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: { id: 'mock-cf-id' },
          computed: {
            caseFile() {
              return mockCaseFile;
            },
            event() {
              return mockEvent;
            },
          },
        });

        wrapper.vm.checkHasRestrictFinancialTags();

        expect(caseFileStore.getTagsOptions).toHaveBeenCalled();
        expect(wrapper.vm.hasRestrictFinancialTags).toEqual(true);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should not call the method initContainsActiveTables', async () => {
        await mountWrapper(false, null, UserRoles.readonly);

        wrapper.vm.initContainsActiveTables = jest.fn();

        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.initContainsActiveTables).toHaveBeenCalledTimes(0);
      });

      it('should call the method initContainsActiveTables', async () => {
        await mountWrapper(false, null, UserRoles.contributorFinance);

        wrapper.vm.initContainsActiveTables = jest.fn();

        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        await flushPromises();
        expect(wrapper.vm.initContainsActiveTables).toHaveBeenCalledTimes(1);
      });

      it('should not call the method checkHasRestrictFinancialTags', async () => {
        await mountWrapper(false, null, UserRoles.readonly);

        wrapper.vm.checkHasRestrictFinancialTags = jest.fn();

        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.checkHasRestrictFinancialTags).toHaveBeenCalledTimes(0);
      });

      it('should call the method checkHasRestrictFinancialTags', async () => {
        await mountWrapper(false, null, UserRoles.contributorFinance);

        wrapper.vm.checkHasRestrictFinancialTags = jest.fn();

        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        await flushPromises();
        expect(caseFileStore.fetchTagsOptions).toHaveBeenCalled();
        expect(wrapper.vm.checkHasRestrictFinancialTags).toHaveBeenCalledTimes(1);
      });

      it('should not call fetchTagsOptions', async () => {
        await mountWrapper(false, null, UserRoles.readonly);

        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(caseFileStore.fetchTagsOptions).not.toHaveBeenCalled();
      });

      it('should call fetchTagsOptions', async () => {
        await mountWrapper(false, null, UserRoles.contributorFinance);

        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(caseFileStore.fetchTagsOptions).toHaveBeenCalled();
      });
    });
  });
});
