import { RcDataTable } from '@libs/component-lib/components';
import { EFilterType } from '@libs/component-lib/types';
import flushPromises from 'flush-promises';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import { mockCombinedCaseFinancialAssistance } from '@/entities/financial-assistance-payment';
import routes from '@/constants/routes';
import { mockCombinedEvent, EEventStatus } from '@/entities/event';
import Component from './FinancialAssistancePaymentsList.vue';

let storage = mockStorage();
const localVue = createLocalVue();
const mockEvent = mockCombinedEvent();
mockEvent.entity.schedule.status = EEventStatus.Open;

describe('FinancialAssistancePaymentsList.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: { id: 'mock-cf-id' },
      computed: {
        event() {
          return mockEvent;
        },
      },
      mocks: {
        $hasLevel: (lvl) => (lvl <= `level${level}`) && !!level,
        $hasRole: (r) => r === hasRole,
        $storage: storage,
      },
      ...additionalOverwrites,
    });

    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
    storage = mockStorage();
    jest.clearAllMocks();
    storage = mockStorage();
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
        expect(headers.wrappers[5].find('span').text()).toBe('');
        expect(headers.wrappers[6].find('span').text()).toBe('');
      });

      it('displays the correct row', async () => {
        const tds = wrapper.findAll('td');

        expect(tds.wrappers[1].text()).toBe('thl payment');
        expect(tds.wrappers[2].text()).toBe('Apr 6, 2021');
        expect(tds.wrappers[3].text()).toBe('$123.00');
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
    });

    it('shows edit when item is new and canEdit', async () => {
      await mountWrapper(true, 6, null, {
        computed: {
          canEdit: () => true,
        },
      });
      await flushPromises();
      expect(wrapper.findDataTest('edit-link').exists()).toBeTruthy();

      storage.financialAssistancePayment.getters.getByIds()[0].entity.approvalStatus = 2;
      await wrapper.vm.$nextTick();
      expect(wrapper.findDataTest('edit-link').exists()).toBeFalsy();

      storage.financialAssistancePayment.getters.getByIds()[0].entity.approvalStatus = 1;
      await wrapper.vm.$nextTick();

      await mountWrapper(true, 6, null, {
        computed: {
          canEdit: () => false,
        },
      });
      expect(wrapper.findDataTest('edit-link').exists()).toBeFalsy();
    });

    it('shows delete when item is new and canDelete', async () => {
      await mountWrapper(true, 6, null, {
        computed: {
          canDelete: () => true,
        },
      });
      await flushPromises();
      expect(wrapper.findDataTest('delete-link').exists()).toBeTruthy();

      storage.financialAssistancePayment.getters.getByIds()[0].entity.approvalStatus = 2;
      await wrapper.vm.$nextTick();
      expect(wrapper.findDataTest('delete-link').exists()).toBeFalsy();

      storage.financialAssistancePayment.getters.getByIds()[0].entity.approvalStatus = 1;
      await wrapper.vm.$nextTick();

      await mountWrapper(true, 6, null, {
        computed: {
          canDelete: () => false,
        },
      });
      expect(wrapper.findDataTest('delete-link').exists()).toBeFalsy();
    });

    it('shows history when item is approved', async () => {
      await mountWrapper(true);
      expect(wrapper.findDataTest('history-link').exists()).toBeFalsy();

      storage.financialAssistancePayment.getters.getByIds()[0].entity.approvalStatus = 3;
      await wrapper.vm.$nextTick();
      expect(wrapper.findDataTest('history-link').exists()).toBeTruthy();

      storage.financialAssistancePayment.getters.getByIds()[0].entity.approvalStatus = 1;
      await wrapper.vm.$nextTick();
      expect(wrapper.findDataTest('history-link').exists()).toBeFalsy();
    });
  });

  describe('Computed', () => {
    describe('canAdd', () => {
      it('returns true for level1+ when not readonly', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.canAdd).toBeTruthy();
        await mountWrapper(false, 1, null,
          {
            computed: {
              readonly() {
                return true;
              },
            },
          });
        expect(wrapper.vm.canAdd).toBeFalsy();
        await mountWrapper(false, null);
        expect(wrapper.vm.canAdd).toBeFalsy();
        await mountWrapper(false, null, 'readonly');
        expect(wrapper.vm.canAdd).toBeFalsy();
        await mountWrapper(false, null, 'contributor3');
        expect(wrapper.vm.canAdd).toBeFalsy();
        await mountWrapper(false, null, 'contributorFinance');
        expect(wrapper.vm.canAdd).toBeFalsy();
      });
    });

    describe('canEdit', () => {
      it('returns true for level1+ only when not readonly', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.canEdit).toBeTruthy();
        await mountWrapper(false, 1, null,
          {
            computed: {
              readonly() {
                return true;
              },
            },
          });
        expect(wrapper.vm.canEdit).toBeFalsy();
        await mountWrapper(false, null);
        expect(wrapper.vm.canEdit).toBeFalsy();
        await mountWrapper(false, null, 'readonly');
        expect(wrapper.vm.canEdit).toBeFalsy();
        await mountWrapper(false, null, 'contributor3');
        expect(wrapper.vm.canEdit).toBeFalsy();
        await mountWrapper(false, null, 'contributorFinance');
        expect(wrapper.vm.canEdit).toBeFalsy();
      });
    });

    describe('canDelete', () => {
      it('returns true for level1+ when not readonly', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.canDelete).toBeTruthy();
        await mountWrapper(false, 1, null,
          {
            computed: {
              readonly() {
                return true;
              },
            },
          });
        expect(wrapper.vm.canDelete).toBeFalsy();
        await mountWrapper(false, null);
        expect(wrapper.vm.canDelete).toBeFalsy();
        await mountWrapper(false, null, 'readonly');
        expect(wrapper.vm.canDelete).toBeFalsy();
        await mountWrapper(false, null, 'contributor3');
        expect(wrapper.vm.canDelete).toBeFalsy();
        await mountWrapper(false, null, 'contributorFinance');
        expect(wrapper.vm.canDelete).toBeFalsy();
      });
    });

    describe('tableData', () => {
      it('should call getById', async () => {
        await mountWrapper();
        await wrapper.setData({ searchResultIds: ['abc'] });
        const data = wrapper.vm.tableData;
        expect(storage.financialAssistancePayment.getters.getByIds).toHaveBeenCalledWith(['abc'],
          {
            baseDate: null, onlyActive: true, prependPinnedItems: true, parentId: { caseFileId: 'mock-cf-id' },
          });
        expect(data.length).toBe(storage.financialAssistancePayment.getters.getByIds().length);
      });
    });

    describe('itemsToSubmit', () => {
      it('should filter for new items', async () => {
        const data = [mockCombinedCaseFinancialAssistance(), mockCombinedCaseFinancialAssistance(), mockCombinedCaseFinancialAssistance()];
        data[1].entity.approvalStatus = 2;
        storage.financialAssistancePayment.getters.getByIds = jest.fn(() => data);
        await mountWrapper();
        jest.clearAllMocks();
        await wrapper.setData({ allItemsIds: ['abc'] });
        expect(wrapper.vm.itemsToSubmit).toEqual([data[0], data[2]]);
        expect(storage.financialAssistancePayment.getters.getByIds).toHaveBeenCalledWith(['abc'],
          {
            baseDate: null, onlyActive: true, prependPinnedItems: true, parentId: { caseFileId: 'mock-cf-id' },
          });
      });
    });

    describe('itemsToSubmitSelectAll', () => {
      it('sets or remove all selectedItems', async () => {
        const data = [mockCombinedCaseFinancialAssistance(), mockCombinedCaseFinancialAssistance(), mockCombinedCaseFinancialAssistance()];
        data[0].entity.id = 'id-0';
        data[1].entity.id = 'id-1';
        data[2].entity.id = 'id-2';
        storage.financialAssistancePayment.getters.getByIds = jest.fn(() => data);
        await mountWrapper();
        expect(wrapper.vm.selectedItems).toEqual([]);
        expect(wrapper.vm.itemsToSubmitSelectAll).toBeFalsy();
        wrapper.vm.itemsToSubmitSelectAll = true;
        expect(wrapper.vm.selectedItems).toEqual(['id-0', 'id-1', 'id-2']);
        expect(wrapper.vm.itemsToSubmitSelectAll).toBeTruthy();
        wrapper.vm.itemsToSubmitSelectAll = false;
        expect(wrapper.vm.selectedItems).toEqual([]);

        await wrapper.setData({ selectedItems: ['id-0', 'id-1', 'id-2'] });
        expect(wrapper.vm.itemsToSubmitSelectAll).toBeTruthy();

        await wrapper.setData({ selectedItems: ['id-0'] });
        expect(wrapper.vm.itemsToSubmitSelectAll).toBeFalsy();
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
  });

  describe('Methods', () => {
    describe('fetchData', () => {
      let params;

      beforeEach(() => {
        params = {
          search: 'query', filter: { MyFilter: 'zzz' }, top: 10, skip: 10, orderBy: 'name asc',
        };
      });

      it('should call storage actions with proper parameters', async () => {
        await mountWrapper();
        await wrapper.vm.fetchData(params);

        expect(wrapper.vm.$storage.financialAssistancePayment.actions.search).toHaveBeenCalledWith({
          search: params.search,
          filter: { 'Entity/CaseFileId': wrapper.vm.id, MyFilter: 'zzz' },
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
          queryType: 'full',
          searchMode: 'all',
        });
      });
    });

    describe('isModifiable', () => {
      it('checks for isNew', async () => {
        await mountWrapper();
        const mock = mockCombinedCaseFinancialAssistance();
        mock.entity.approvalStatus = 2;
        expect(wrapper.vm.isModifiable(mock)).toBeFalsy();
        mock.entity.approvalStatus = 1;
        expect(wrapper.vm.isModifiable(mock)).toBeTruthy();
      });
    });

    describe('showApprovalDialog', () => {
      it('sets variables for dialog', async () => {
        await mountWrapper();
        expect(wrapper.vm.selectedItem).toBeNull();
        expect(wrapper.vm.showApprovalHistory).toBeFalsy();
        const mock = mockCombinedCaseFinancialAssistance();
        wrapper.vm.showApprovalDialog(mock);
        expect(wrapper.vm.selectedItem).toBe(mock.entity);
        expect(wrapper.vm.showApprovalHistory).toBeTruthy();
      });
    });

    describe('canViewHistory', () => {
      it('checks for Approved', async () => {
        await mountWrapper();
        const mock = mockCombinedCaseFinancialAssistance();
        mock.entity.approvalStatus = 2;
        expect(wrapper.vm.canViewHistory(mock)).toBeFalsy();
        mock.entity.approvalStatus = 3;
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
        const mock = mockCombinedCaseFinancialAssistance();
        await mountWrapper();
        await wrapper.vm.deletePayment(mock);
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({
          title: 'caseFile.financialAssistance.confirm.delete.title',
          messages: 'caseFile.financialAssistance.confirm.delete.message',
        });
        expect(storage.financialAssistancePayment.actions.deactivate)
          .toHaveBeenCalledWith(mock.entity.id);
      });
      it('doesnt call deactivate if no confirmation', async () => {
        const mock = mockCombinedCaseFinancialAssistance();
        await mountWrapper();
        wrapper.vm.$confirm = jest.fn(() => false);
        await wrapper.vm.deletePayment(mock);
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({
          title: 'caseFile.financialAssistance.confirm.delete.title',
          messages: 'caseFile.financialAssistance.confirm.delete.message',
        });
        expect(storage.financialAssistancePayment.actions.deactivate)
          .toHaveBeenCalledTimes(0);
      });
    });

    describe('routeToCreate', () => {
      it('goes to route if active tables exist', async () => {
        await mountWrapper();
        await wrapper.vm.routeToCreate();
        expect(wrapper.vm.$router.push).toHaveBeenLastCalledWith({ name: routes.caseFile.financialAssistance.create.name });
      });
      it('goes to route if no active tables exist', async () => {
        storage.financialAssistance.actions.search = jest.fn(() => ({ ids: [] }));
        await mountWrapper();
        await wrapper.vm.routeToCreate();
        expect(storage.financialAssistance.actions.search).toHaveBeenCalled();
        expect(wrapper.vm.$router.push).not.toHaveBeenCalled();
      });
    });

    describe('submitSelectedPayments', () => {
      it('calls submit for all selected', async () => {
        await mountWrapper();
        await wrapper.setData({ selectedItems: ['id-0', 'id-1', 'id-2'] });
        await wrapper.vm.submitSelectedPayments();
        expect(storage.financialAssistancePayment.actions.submitFinancialAssistancePayment)
          .toHaveBeenCalledWith('id-0');
        expect(storage.financialAssistancePayment.actions.submitFinancialAssistancePayment)
          .toHaveBeenCalledWith('id-1');
        expect(storage.financialAssistancePayment.actions.submitFinancialAssistancePayment)
          .toHaveBeenCalledWith('id-2');
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should call storage for all items', async () => {
        await mountWrapper();
        expect(storage.financialAssistancePayment.actions.search).toHaveBeenCalledWith(
          { filter: { 'Entity/CaseFileId': wrapper.vm.id } },
        );
        expect(wrapper.vm.allItemsIds).toEqual(storage.financialAssistancePayment.actions.search().ids);
      });

      it('should not call the method initContainsActiveTables', async () => {
        await mountWrapper(false, null, 'readonly');

        wrapper.vm.initContainsActiveTables = jest.fn();

        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.initContainsActiveTables).toHaveBeenCalledTimes(0);
      });

      it('should call the method initContainsActiveTables', async () => {
        await mountWrapper(false, null, 'contributorFinance');

        wrapper.vm.initContainsActiveTables = jest.fn();

        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.initContainsActiveTables).toHaveBeenCalledTimes(1);
      });
    });
  });
});
