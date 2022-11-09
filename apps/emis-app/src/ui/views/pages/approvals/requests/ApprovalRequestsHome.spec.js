import { shallowMount, createLocalVue, mount } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import routes from '@/constants/routes';
import { RcDataTable } from '@libs/component-lib/components';
import { mockCombinedCaseFinancialAssistance } from '@libs/entities-lib/financial-assistance-payment';
import { EFilterType } from '@libs/component-lib/types';
import Component from './ApprovalRequestsHome.vue';

const localVue = createLocalVue();
const storage = mockStorage();
let wrapper;

const FAPayment = mockCombinedCaseFinancialAssistance();
storage.user.getters.userId = jest.fn(() => '1234');
storage.financialAssistancePayment.getters.getByIds = jest.fn(() => [FAPayment]);

const doMount = (otherOptions = {}) => {
  const options = {
    localVue,
    mocks: { $storage: storage },
    ...otherOptions,
  };
  wrapper = shallowMount(Component, options);
};

describe('ApprovalRequestsHome', () => {
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

    describe('filters', () => {
      it('returns the right data', async () => {
        await wrapper.setData({
          submittedToQuery: 'q1',
          submittedByQuery: 'q2',
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
            items: wrapper.vm.submittedByUsers,
            loading: wrapper.vm.submittedLoading.by,
            props: {
              'no-data-text': 'common.search.no_result',
              'search-input': wrapper.vm.submittedByQuery,
              'no-filter': true,
              'return-object': false,
              placeholder: 'common.filters.autocomplete.placeholder',
            },
          },
          {
            key: 'Entity/SubmittedTo/UserId',
            type: EFilterType.MultiSelect,
            label: 'approvalRequestsTable.submittedTo',
            items: wrapper.vm.submittedToUsers,
            loading: wrapper.vm.submittedLoading.to,
            props: {
              'no-data-text': 'common.search.no_result',
              'search-input': wrapper.vm.submittedToQuery,
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

    it('should call fetchRoles', async () => {
      wrapper.vm.$storage.userAccount.actions.fetchRoles = jest.fn();
      await wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.$storage.userAccount.actions.fetchRoles).toHaveBeenCalled();
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
    beforeEach(() => doMount());
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

    describe('additionalFilters', () => {
      it('returns the right value', () => {
        expect(wrapper.vm.additionalFilters()).toEqual({ submittedToMeFilter: wrapper.vm.submittedToMeSwitch });
      });
    });

    describe('setAdditionalFilters', () => {
      it('sets the right value into submittedToMeSwitch', async () => {
        wrapper.vm.onApplyFilter = jest.fn();
        await wrapper.vm.setAdditionalFilters({ submittedToMeFilter: {} });
        expect(wrapper.vm.submittedToMeSwitch).toBeTruthy();
      });
    });
  });

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        computed: {
          tableData: () => [FAPayment],
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

      it('displays the correct header values', () => {
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
