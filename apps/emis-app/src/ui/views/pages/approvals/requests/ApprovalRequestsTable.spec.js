import { shallowMount, createLocalVue, mount } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import routes from '@/constants/routes';
import { RcDataTable } from '@libs/component-lib/components';
import { mockCombinedCaseFinancialAssistance, ApprovalStatus } from '@libs/entities-lib/financial-assistance-payment';
import { ITEM_ROOT } from '@libs/services-lib/odata-query/odata-query';
import { Status } from '@libs/entities-lib/base';
import { EFilterType } from '@libs/component-lib/types';

import { createTestingPinia } from '@pinia/testing';
import { useUserStore } from '@/pinia/user/user';

import Component from './ApprovalRequestsTable.vue';

const localVue = createLocalVue();

const storage = mockStorage();
let wrapper;
let userStore;

const FAPayment = mockCombinedCaseFinancialAssistance();
storage.financialAssistancePayment.getters.getByIds = jest.fn(() => [FAPayment]);

const doMount = (otherOptions = {}) => {
  const options = {
    localVue,
    pinia: createTestingPinia({ stubActions: false }),
    mocks: { $storage: storage },
    ...otherOptions,
  };
  wrapper = shallowMount(Component, options);
  userStore = useUserStore();
  userStore.getUserId = jest.fn(() => '1234');
};

describe('ApprovalRequestsTable', () => {
  describe('Computed', () => {
    beforeEach(() => doMount());
    describe('myUserId', () => {
      it('returns the right value', () => {
        expect(wrapper.vm.myUserId).toEqual('1234');
      });
    });

    describe('tableData', () => {
      it(' returns the right value', () => {
        expect(wrapper.vm.tableData).toEqual([FAPayment]);
      });
    });

    describe('presetFilters', () => {
      it('returns the right data if table contains pending requests', () => {
        doMount({
          propsData: { isPendingRequests: true },
          computed: {
            myRoleId() {
              return 'my-role-id';
            },
            myUserId() {
              return 'my-user-id';
            },
          },
        });
        expect(wrapper.vm.presetFilter).toEqual({
          or: [
            { 'Entity/ApprovalStatus': ApprovalStatus.Pending },
          ],
          'Entity/Status': Status.Active,
          Metadata: {
            CurrentApprovalGroupRoles: {
              any: {
                [ITEM_ROOT]: 'my-role-id',
              },
            },
          },
          not: {
            Entity: {
              SubmittedBy: {
                UserId: 'my-user-id',
              },
            },
          },
        });
      });

      it('returns the right data if table contains approved requests', () => {
        doMount({
          propsData: { isPendingRequests: false },
          computed: {
            myRoleId() {
              return 'my-role-id';
            },
          },
        });
        expect(wrapper.vm.presetFilter).toEqual({
          or: [
            { 'Entity/ApprovalStatus': ApprovalStatus.Approved },
          ],
          'Entity/Status': Status.Active,
          Entity: {
            ApprovalTableGroupsSnapshots: {
              any: {
                Roles: {
                  any: {
                    [ITEM_ROOT]: 'my-role-id',
                  },
                },
              },
            },
          },
        });
      });
    });

    describe('customColumns', () => {
      it('returns the right data if tables is for pending requests', () => {
        doMount({
          propsData: { isPendingRequests: true },
        });
        expect(wrapper.vm.customColumns).toEqual({
          caseFileNumber: 'Metadata/CaseFileNumber',
          payment: 'Entity/Name',
          submittedBy: 'Entity/SubmittedBy/UserName',
          submittedTo: 'Entity/SubmittedTo/UserName',
          event: 'Metadata/EventName/Translation/en',
          submissionStartedDate: 'Entity/SubmissionStartedDate',
          amount: 'Metadata/Total',
          actionable: 'action',
        });
      });

      it('returns the right data if tables is for approved requests', () => {
        doMount({
          propsData: { isPendingRequests: false },
        });
        expect(wrapper.vm.customColumns).toEqual({
          caseFileNumber: 'Metadata/CaseFileNumber',
          payment: 'Entity/Name',
          submittedBy: 'Entity/SubmittedBy/UserName',
          submittedTo: 'Entity/SubmittedTo/UserName',
          event: 'Metadata/EventName/Translation/en',
          submissionStartedDate: 'Entity/SubmissionStartedDate',
          amount: 'Metadata/Total',
        });
      });
    });

    describe('headers', () => {
      it('returns the right data if tables is for pending requests', () => {
        doMount({
          propsData: { isPendingRequests: true },
        });
        expect(wrapper.vm.headers).toEqual(
          [
            {
              text: 'approvalRequestsTable.caseFileNumber',
              sortable: true,
              value: wrapper.vm.customColumns.caseFileNumber,
            },
            {
              text: 'approvalRequestsTable.payment',
              sortable: true,
              value: wrapper.vm.customColumns.payment,
            },
            {
              text: 'approvalRequestsTable.submittedBy',
              sortable: true,
              value: wrapper.vm.customColumns.submittedBy,
            },
            {
              text: 'approvalRequestsTable.submittedTo',
              sortable: true,
              value: wrapper.vm.customColumns.submittedTo,
            },
            {
              text: 'approvalRequestsTable.event',
              sortable: true,
              value: wrapper.vm.customColumns.event,
            },
            {
              text: 'approvalRequestsTable.dateSubmitted',
              sortable: true,
              value: wrapper.vm.customColumns.submissionStartedDate,
            },
            {
              text: 'approvalRequestsTable.amount',
              sortable: true,
              align: 'end',
              value: wrapper.vm.customColumns.amount,
            },
            {
              text: 'approvalRequestsTable.action',
              align: 'center',
              sortable: false,
              width: '120px',
              value: wrapper.vm.customColumns.actionable,
            }],
        );
      });

      it('returns the right data if tables is for approved requests', () => {
        doMount({
          propsData: { isPendingRequests: false },
        });
        expect(wrapper.vm.headers).toEqual(
          [
            {
              text: 'approvalRequestsTable.caseFileNumber',
              sortable: true,
              value: wrapper.vm.customColumns.caseFileNumber,
            },
            {
              text: 'approvalRequestsTable.payment',
              sortable: true,
              value: wrapper.vm.customColumns.payment,
            },
            {
              text: 'approvalRequestsTable.submittedBy',
              sortable: true,
              value: wrapper.vm.customColumns.submittedBy,
            },
            {
              text: 'approvalRequestsTable.submittedTo',
              sortable: true,
              value: wrapper.vm.customColumns.submittedTo,
            },
            {
              text: 'approvalRequestsTable.event',
              sortable: true,
              value: wrapper.vm.customColumns.event,
            },
            {
              text: 'approvalRequestsTable.dateSubmitted',
              sortable: true,
              value: wrapper.vm.customColumns.submissionStartedDate,
            },
            {
              text: 'approvalRequestsTable.amount',
              sortable: true,
              align: 'end',
              value: wrapper.vm.customColumns.amount,
            }],
        );
      });
    });

    describe('filters', () => {
      it('returns the right data', async () => {
        await wrapper.setData({
          userAccountFilterState: { submittedBy: { query: 'q1' }, submittedTo: { query: 'q2' } },
          eventFilterQuery: 'q3',
        });

        expect(wrapper.vm.filters).toEqual([
          {
            key: wrapper.vm.customColumns.payment,
            type: EFilterType.Text,
            label: 'approvalRequestsTable.payment',
          },
          {
            key: 'Entity/SubmittedBy/UserId',
            type: EFilterType.MultiSelect,
            label: 'approvalRequestsTable.submittedBy',
            items: wrapper.vm.userAccountFilterState.submittedBy.users,
            loading: wrapper.vm.userAccountFilterState.submittedBy.loading,
            props: {
              'no-data-text': 'common.search.no_result',
              'search-input': wrapper.vm.userAccountFilterState.submittedBy.query,
              'no-filter': true,
              'return-object': false,
              placeholder: 'common.filters.autocomplete.placeholder',
            },
          },
          {
            key: 'Entity/SubmittedTo/UserId',
            type: EFilterType.MultiSelect,
            label: 'approvalRequestsTable.submittedTo',
            items: wrapper.vm.userAccountFilterState.submittedTo.users,
            loading: wrapper.vm.userAccountFilterState.submittedTo.loading,
            props: {
              'no-data-text': 'common.search.no_result',
              'search-input': wrapper.vm.userAccountFilterState.submittedTo.query,
              'no-filter': true,
              'return-object': false,
              placeholder: 'common.filters.autocomplete.placeholder',
            },
          },
          {
            key: 'Metadata/EventId',
            type: EFilterType.Select,
            label: 'approvalRequestsTable.event',
            items: wrapper.vm.sortedEventsFilter,
            loading: wrapper.vm.eventsFilterLoading,
            props: {
              'no-data-text': 'common.search.no_result',
              'search-input': wrapper.vm.eventFilterQuery,
              'no-filter': true,
              'return-object': true,
              placeholder: 'common.filters.autocomplete.placeholder',
            },
          },
          {
            key: wrapper.vm.customColumns.submissionStartedDate,
            type: EFilterType.Date,
            label: 'approvalRequestsTable.dateSubmitted',
          },
          {
            key: wrapper.vm.customColumns.amount,
            type: EFilterType.Number,
            label: 'approvalRequestsTable.amount',
          },
        ]);
      });
    });
  });

  describe('Created', () => {
    beforeEach(() => doMount());
    it('should set saveState to true', async () => {
      await wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.saveState).toEqual(true);
    });

    it('should load state of the table', async () => {
      wrapper.vm.loadState = jest.fn();
      await wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.loadState).toHaveBeenCalled();
    });
  });

  describe('Watch', () => {
    beforeEach(async () => {
      doMount();
      await wrapper.setData({
        submittedToMeSwitch: false,
      });
    });
    describe('submittedToMeSwitch', () => {
      describe('On', () => {
        it('should call onApplyFilter with filters from the panel + submittedToMeFilter', async () => {
          wrapper.vm.onApplyFilter = jest.fn();
          const expected = { preparedFilters: { ...wrapper.vm.userFilters, ...wrapper.vm.submittedToMeFilter } };

          await wrapper.setData({
            submittedToMeSwitch: true,
          });

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenCalledWith(expected, null);
        });
      });

      describe('Off', () => {
        it('should call onApplyFilter with {} if the only filter is submittedToMeFilter', async () => {
          wrapper.vm.onApplyFilter = jest.fn();

          await wrapper.setData({
            submittedToMeSwitch: true,
          });

          await wrapper.setData({
            submittedToMeSwitch: false,
          });

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenLastCalledWith({ preparedFilters: {} }, null);
        });

        it('should call onApplyFilter with filters from the panel if present', async () => {
          wrapper.vm.onApplyFilter = jest.fn();

          await wrapper.setData({
            submittedToMeSwitch: true,
          });

          const filterFromPanel = {
            test: {},
          };

          await wrapper.setData({
            submittedToMeSwitch: false,
            userFilters: {
              ...wrapper.vm.submittedToMeFilter,
              ...filterFromPanel,
            },
          });

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenLastCalledWith({ preparedFilters: filterFromPanel }, null);
        });
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => doMount({
      computed: {
        myRoleId: () => 'my-role-id',
      },
    }));

    describe('getFinancialAssistanceDetailsRoute', () => {
      it('returns the right route object', () => {
        const caseFileId = '1234';
        const fapId = '5678';
        expect(wrapper.vm.getFinancialAssistanceDetailsRoute(caseFileId, fapId))
          .toEqual({
            name: routes.caseFile.financialAssistance.details.name,
            params: {
              id: caseFileId,
              financialAssistancePaymentId: fapId,
            },
          });
      });
    });

    describe('getCaseFileDetailsRoute', () => {
      it('returns the right route object', () => {
        const caseFileId = '1234';
        expect(wrapper.vm.getCaseFileDetailsRoute(caseFileId))
          .toEqual({
            name: routes.caseFile.activity.name,
            params: {
              id: caseFileId,
            },
          });
      });
    });

    describe('openActionDialog', () => {
      it('sets the right values into the right properties', async () => {
        const payment = { nextRoleGroup: ['1'] };
        await wrapper.vm.openActionDialog(payment);
        expect(wrapper.vm.paymentToAction).toEqual(payment);
        expect(wrapper.vm.showActionDialog).toEqual(true);
      });
    });

    describe('onApplyFilterLocal', () => {
      describe('when user is using submittedToMe filter', () => {
        it('should call onApplyFilter with proper filters if filters panel also', async () => {
          wrapper.vm.onApplyFilter = jest.fn();
          await wrapper.setData({
            submittedToMeSwitch: true,
          });

          const preparedFilters = { test: {} };

          await wrapper.vm.onApplyFilterLocal({
            preparedFilters,
            searchFilters: null,
          }, { name: 'filterState' });

          expect(wrapper.vm.onApplyFilter)
            .toHaveBeenLastCalledWith({
              preparedFilters: { ...preparedFilters, ...wrapper.vm.submittedToMeFilter },
              searchFilters: null,
            }, { name: 'filterState' });
        });
      });

      describe('when user is not using my case file filter', () => {
        it('should call onApplyFilter with proper filters', async () => {
          wrapper.vm.onApplyFilter = jest.fn();
          await wrapper.setData({
            submittedToMeSwitch: false,
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

    describe('fetchData', () => {
      it('should call storage actions with proper parameters', async () => {
        const params = {
          search: 'query',
          filter: 'filter',
          top: 10,
          skip: 10,
          orderBy: 'name asc',
        };
        await wrapper.vm.fetchData(params);

        expect(wrapper.vm.$storage.financialAssistancePayment.actions.search)
          .toHaveBeenCalledWith({
            search: params.search,
            filter: params.filter,
            top: params.top,
            skip: params.skip,
            orderBy: params.orderBy,
            count: true,
            queryType: 'full',
            searchMode: 'all',
          }, null, true);
      });
    });

    describe('updateActionedItems', () => {
      it('adds the argument to the list of actionedItems', async () => {
        wrapper.setData({ actionedItems: [] });
        wrapper.vm.updateActionedItems('item-1');
        expect(wrapper.vm.actionedItems).toEqual(['item-1']);
      });
    });

    describe('isActionDone', () => {
      it('returns true if argument is in actionedItems', async () => {
        wrapper.setData({ actionedItems: ['item-1'] });
        expect(wrapper.vm.isActionDone('item-1')).toEqual(true);
      });

      it('returns false if argument is not in actionedItems', async () => {
        wrapper.setData({ actionedItems: ['item-1'] });
        expect(wrapper.vm.isActionDone('item-2')).toEqual(false);
      });
    });

    describe('additionalFilters', () => {
      it('returns the right value', () => {
        expect(wrapper.vm.additionalFilters()).toEqual({ submittedToMeFilter: wrapper.vm.submittedToMeSwitch, searchTerm: wrapper.vm.searchTerm });
      });
    });

    describe('setAdditionalFilters', () => {
      it('sets the right value into submittedToMeSwitch', async () => {
        wrapper.vm.onApplyFilter = jest.fn();
        await wrapper.vm.setAdditionalFilters({ submittedToMeFilter: {} });
        expect(wrapper.vm.submittedToMeSwitch).toBeTruthy();
      });
      it('sets the right value into searchTerm', async () => {
        wrapper.vm.onApplyFilter = jest.fn();
        await wrapper.vm.setAdditionalFilters({ searchTerm: 'test' });
        expect(wrapper.vm.searchTerm).toEqual('test');
      });
    });

    describe('onLoadApprovalFilters', () => {
      it('should call onLoadFilter ', async () => {
        wrapper.vm.onLoadFilter = jest.fn();
        const filterFormData = {
          name: 'form',
          values: {
            'Entity/EventId': { operator: '', value: { text: 'event name', value: '1' } },
          },
        };
        await wrapper.vm.onLoadApprovalFilters(filterFormData);
        expect(wrapper.vm.onLoadFilter).toHaveBeenCalledWith(filterFormData, 'Metadata/EventId');
      });

      it('should call onLoadUserAccountFilters ', async () => {
        wrapper.vm.onLoadUserAccountFilters = jest.fn();
        const filterFormData = {
          name: 'form',
          values: {
            'Entity/EventId': { operator: '', value: { text: 'event name', value: '1' } },
          },
        };
        await wrapper.vm.onLoadApprovalFilters(filterFormData);
        expect(wrapper.vm.onLoadUserAccountFilters).toHaveBeenCalledWith(filterFormData);
      });
    });

    describe('onOpenFilters', () => {
      it('calls fetchEventsFilter and fetchUsers', () => {
        wrapper.vm.fetchEventsFilter = jest.fn();
        wrapper.vm.fetchUsers = jest.fn();
        wrapper.vm.onOpenFilters();
        expect(wrapper.vm.fetchEventsFilter).toHaveBeenCalled();
        expect(wrapper.vm.fetchUsers).toHaveBeenCalledWith('', 'submittedBy');
        expect(wrapper.vm.fetchUsers).toHaveBeenCalledWith('', 'submittedTo');
      });
    });
  });

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        computed: {
          mappedPayments: () => [FAPayment],
        },
        mocks: { $storage: storage },
      });

      wrapper.vm.getFinancialAssistanceDetailsRoute = jest.fn(() => ({
        name: routes.caseFile.financialAssistance.details.name,
        params: {
          id: '1',
          financialAssistancePaymentId: '2',
        },
      }));

      wrapper.vm.getCaseFileDetailsRoute = jest.fn(() => ({
        name: routes.caseFile.activity.name,
        params: {
          id: '1',
        },
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

      it('displays the correct header values', async () => {
        await wrapper.setProps({ isPendingRequests: true });
        const headers = wrapper.findAll('th');

        expect(headers.length)
          .toBe(8);

        expect(headers.wrappers[0].find('span')
          .text())
          .toBe('approvalRequestsTable.caseFileNumber');
        expect(headers.wrappers[1].find('span')
          .text())
          .toBe('approvalRequestsTable.payment');
        expect(headers.wrappers[2].find('span')
          .text())
          .toBe('approvalRequestsTable.submittedBy');
        expect(headers.wrappers[3].find('span')
          .text())
          .toBe('approvalRequestsTable.submittedTo');
        expect(headers.wrappers[4].find('span')
          .text())
          .toBe('approvalRequestsTable.event');
        expect(headers.wrappers[5].find('span')
          .text())
          .toBe('approvalRequestsTable.dateSubmitted');
        expect(headers.wrappers[6].find('span')
          .text())
          .toBe('approvalRequestsTable.amount');
      });
    });

    describe('table elements', () => {
      test('case file number redirects to getCaseFileRoute', () => {
        const link = wrapper.findDataTest('approval_requests_case-file-link');
        expect(link.props('to'))
          .toEqual({
            name: routes.caseFile.activity.name,
            params: {
              id: '1',
            },
          });
      });

      test('Payment redirects to getFinancialAssistanceDetailsRoute', () => {
        const link = wrapper.findDataTest('approval_requests_fa-link');
        expect(link.props('to'))
          .toEqual({
            name: routes.caseFile.financialAssistance.details.name,
            params: {
              id: '1',
              financialAssistancePaymentId: '2',
            },
          });
      });
    });
  });
});
