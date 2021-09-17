import { RcDataTable } from '@crctech/component-library';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import { mockCombinedCaseFinancialAssistance } from '@/entities/financial-assistance-payment';
import Component from './FinancialAssistancePaymentsList.vue';
import routes from '@/constants/routes';

const storage = mockStorage();
const localVue = createLocalVue();

describe('FinancialAssistancePaymentsList.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
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

        expect(headers.length).toBe(6);

        expect(headers.wrappers[0].find('span').text()).toBe('caseFilesTable.tableHeaders.name');
        expect(headers.wrappers[1].find('span').text()).toBe('caseFilesTable.filters.createdDate');
        expect(headers.wrappers[2].find('span').text()).toBe('caseFile.financialAssistance.totals');
        expect(headers.wrappers[3].find('span').text()).toBe('caseFile.financialAssistance.approvalStatus');
        expect(headers.wrappers[4].find('span').text()).toBe('');
        expect(headers.wrappers[5].find('span').text()).toBe('');
      });

      it('displays the correct row', async () => {
        const tds = wrapper.findAll('td');

        expect(tds.wrappers[0].text()).toBe('thl payment');
        expect(tds.wrappers[1].text()).toBe('Apr 6, 2021');
        expect(tds.wrappers[2].text()).toBe('$123.00');
        expect(tds.wrappers[3].text()).toBe('enums.ApprovalStatus.New');
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
  });

  describe('Computed', () => {
    describe('canAdd', () => {
      it('returns true for level1+', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.canAdd).toBeTruthy();
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
      it('returns true for level1+ only', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.canEdit).toBeTruthy();
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
      it('returns true for level1+', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.canDelete).toBeTruthy();
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
        expect(storage.financialAssistancePayment.getters.getByIds).toHaveBeenCalledWith(['abc'], true);
        expect(data.length).toBe(storage.financialAssistancePayment.getters.getByIds().length);
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
          filter: { 'Entity/CaseFileId': wrapper.vm.$route.params.id, MyFilter: 'zzz' },
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
          queryType: 'full',
          searchMode: 'all',
        });
      });

      it('sets vm with the search results', async () => {
        await mountWrapper();
        await wrapper.vm.fetchData(params);
        expect(wrapper.vm.searchResultIds).toEqual(wrapper.vm.$storage.financialAssistancePayment.actions.search().ids);
        expect(wrapper.vm.count).toEqual(wrapper.vm.$storage.financialAssistancePayment.actions.search().count);
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
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith('caseFile.financialAssistance.confirm.delete.title',
          'caseFile.financialAssistance.confirm.delete.message');
        expect(storage.financialAssistancePayment.actions.deactivate)
          .toHaveBeenCalledWith(mock.entity.id);
      });
      it('doesnt call deactivate if no confirmation', async () => {
        const mock = mockCombinedCaseFinancialAssistance();
        await mountWrapper();
        wrapper.vm.$confirm = jest.fn(() => false);
        await wrapper.vm.deletePayment(mock);
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith('caseFile.financialAssistance.confirm.delete.title',
          'caseFile.financialAssistance.confirm.delete.message');
        expect(storage.financialAssistancePayment.actions.deactivate)
          .toHaveBeenCalledTimes(0);
      });
    });
  });
});
