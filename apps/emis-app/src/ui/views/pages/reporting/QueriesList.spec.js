import { createLocalVue, shallowMount } from '@/test/testSetup';
import _orderBy from 'lodash/orderBy';
import routes from '@/constants/routes';
import { createTestingPinia } from '@pinia/testing';
import sharedHelpers from '@libs/shared-lib/helpers/helpers';
import { mockProvider } from '@/services/provider';
import flushPromises from 'flush-promises';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import {
  QueryType, ReportingTopic,
} from '@libs/entities-lib/reporting';
import { mockUserAccountMetadata } from '@libs/entities-lib/user-account';
import Component from './QueriesList.vue';

const localVue = createLocalVue();

const pinia = createTestingPinia({ stubActions: false });
const userAccountMetadataStore = useMockUserAccountStore(pinia).userAccountMetadataStore;
let services = mockProvider();

jest.mock('./standard_queries/standard_queries', () => ({ AllReports: [{
  id: 'someReporten',
  name: 'some report',
  queryType: 2,
  topic: 1,
  state: 'state',
},
{
  id: 'someReportfr',
  name: 'some report fr',
  queryType: 3,
  topic: 1,
  state: 'state',
},
{
  id: 'second en',
  name: 'some report en 2',
  queryType: 2,
  topic: 99,
  state: 'state',
}] }));

describe('QueriesList.vue', () => {
  let wrapper;

  const doMount = async (queryTypeName = 'Custom', level = 5, role = '', otherComputed = {}) => {
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      computed: {
        ...otherComputed,
      },
      propsData: { queryTypeName },
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}`,
        $hasRole: (lvl) => lvl === role,
        $services: services,
      },
    });

    await flushPromises();
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    services = mockProvider();
    await doMount();
  });

  describe('Template', () => {
    describe('queries-table', () => {
      it('should exist', () => {
        expect(wrapper.findDataTest('queries-table').exists()).toBeTruthy();
      });

      it('should be bound to the items', () => {
        expect(wrapper.findDataTest('queries-table').props('items').length).toEqual(wrapper.vm.queryItems.length);
      });
    });

    describe('add button', () => {
      it('exists when type is custom', () => {
        expect(wrapper.findDataTest('queries-table').props('showAddButton')).toBeTruthy();
      });
      it('doesnt exist type is not custom', async () => {
        await doMount('StandardL6');
        expect(wrapper.findDataTest('queries-table').props('showAddButton')).toBeFalsy();
      });
    });
  });

  describe('Computed', () => {
    describe('canAdd', () => {
      it('returns true for L5+ or IM and in custom queries', async () => {
        await doMount('Custom', 5);
        expect(wrapper.vm.canAdd).toBeTruthy();
        await doMount('Custom', 4);
        expect(wrapper.vm.canAdd).toBeFalsy();
        await doMount('L5', 5);
        expect(wrapper.vm.canAdd).toBeFalsy();
        await doMount('Custom', null, 'contributorIM');
        expect(wrapper.vm.canAdd).toBeTruthy();
        await doMount('Custom', null, 'readonly');
        expect(wrapper.vm.canAdd).toBeTruthy();
      });
    });
    describe('queryType', () => {
      it('returns the correct QueryType', async () => {
        expect(wrapper.vm.queryType).toEqual(QueryType.Custom);
        await wrapper.setProps({ queryTypeName: 'StandardL6' });
        expect(wrapper.vm.queryType).toEqual(QueryType.StandardL6en);
      });
    });

    describe('standardReports', () => {
      it('returns the list of reports by query type', async () => {
        expect(wrapper.vm.standardReports).toEqual(null);
        await wrapper.setProps({ queryTypeName: 'StandardL6' });
        expect(wrapper.vm.standardReports).toEqual([
          {
            id: 'someReporten',
            name: 'some report',
            sharedBy: '',
            theme: 'reporting.query.theme.HouseholdMembers',
            isPbiReport: false,
          },
          {
            id: 'second en',
            name: 'some report en 2',
            sharedBy: '',
            theme: 'reporting.query.theme.PowerBi',
            isPbiReport: true,
          },
        ]);
      });
    });

    describe('customColumns', () => {
      it('is defined correctly', () => {
        expect(wrapper.vm.customColumns).toEqual({
          name: 'name',
          theme: 'theme',
          sharedBy: 'sharedBy',
          delete: 'delete',
        });
      });
    });

    describe('headers', () => {
      it('they are defined correctly depending on type being custom', async () => {
        expect(wrapper.vm.headers).toEqual([
          {
            text: 'common.name',
            sortable: true,
            value: wrapper.vm.customColumns.name,
            width: '60%',
          },
          {
            text: 'reporting.query.theme',
            value: wrapper.vm.customColumns.theme,
            sortable: true,
          },
          {
            text: 'reporting.query.sharedBy',
            sortable: true,
            value: wrapper.vm.customColumns.sharedBy,
          },
          {
            text: '',
            value: wrapper.vm.customColumns.delete,
            sortable: false,
            width: '5%',
          },
        ]);

        await doMount('StandardL6');
        expect(wrapper.vm.headers).toEqual([
          {
            text: 'common.name',
            sortable: true,
            value: wrapper.vm.customColumns.name,
            width: '60%',
          },
          {
            text: 'reporting.query.theme',
            value: wrapper.vm.customColumns.theme,
            sortable: true,
          },
        ]);
      });
    });

    describe('labels', () => {
      it('is defined correctly depending on query type', async () => {
        expect(wrapper.vm.labels).toEqual({
          header: {
            title: `reporting.query.title.Custom (${wrapper.vm.queryItems.length})`,
            searchPlaceholder: 'common.inputs.quick_search',
            addButtonLabel: 'reporting.query.add.title',
          },
        });
        await doMount('StandardL6');
        expect(wrapper.vm.labels).toEqual({
          header: {
            title: `reporting.query.title.StandardL6en (${wrapper.vm.queryItems.length})`,
            searchPlaceholder: 'common.inputs.quick_search',
            addButtonLabel: 'reporting.query.add.title',
          },
        });
      });
    });

    describe('availableThemes', () => {
      it('returns data filtered by searchTheme', async () => {
        expect(wrapper.vm.availableThemes).toEqual([
          {
            id: ReportingTopic.CaseFileActivities,
            name: 'reporting.query.theme.CaseFileActivities',
            description: 'reporting.query.theme.CaseFileActivities.description',
          },
          {
            id: ReportingTopic.CaseFileAuthenticationIds,
            name: 'reporting.query.theme.CaseFileAuthenticationIds',
            description: 'reporting.query.theme.CaseFileAuthenticationIds.description',
          },
          {
            id: ReportingTopic.CaseNotes,
            name: 'reporting.query.theme.CaseNotes',
            description: 'reporting.query.theme.CaseNotes.description',
          },
          {
            id: ReportingTopic.HouseholdActivities,
            name: 'reporting.query.theme.HouseholdActivities',
            description: 'reporting.query.theme.HouseholdActivities.description',
          },
          {
            id: ReportingTopic.HouseholdMembers,
            name: 'reporting.query.theme.HouseholdMembers',
            description: 'reporting.query.theme.HouseholdMembers.description',
          },
          {
            id: ReportingTopic.HouseholdPrimary,
            name: 'reporting.query.theme.HouseholdPrimary',
            description: 'reporting.query.theme.HouseholdPrimary.description',
          },
          {
            id: ReportingTopic.LatestCaseFileActivities,
            name: 'reporting.query.theme.LatestCaseFileActivities',
            description: 'reporting.query.theme.LatestCaseFileActivities.description',
          },
          {
            id: ReportingTopic.PaymentGroup,
            name: 'reporting.query.theme.PaymentGroup',
            description: 'reporting.query.theme.PaymentGroup.description',
          },
          {
            id: ReportingTopic.PaymentLine,
            name: 'reporting.query.theme.PaymentLine',
            description: 'reporting.query.theme.PaymentLine.description',
          },
          {
            id: ReportingTopic.PotentialDuplicates,
            name: 'reporting.query.theme.PotentialDuplicates',
            description: 'reporting.query.theme.PotentialDuplicates.description',
          },
          {
            id: ReportingTopic.Referrals,
            name: 'reporting.query.theme.Referrals',
            description: 'reporting.query.theme.Referrals.description',
          },
          {
            id: ReportingTopic.Tasks,
            name: 'reporting.query.theme.Tasks',
            description: 'reporting.query.theme.Tasks.description',
          },
          {
            id: ReportingTopic.TasksHistory,
            name: 'reporting.query.theme.TasksHistory',
            description: 'reporting.query.theme.TasksHistory.description',
          },
          {
            id: ReportingTopic.UsersInTeams,
            name: 'reporting.query.theme.UsersInTeams',
            description: 'reporting.query.theme.UsersInTeams.description',
          },
        ]);
        await wrapper.setData({ searchTheme: 'HouseholdPrimary' });
        expect(wrapper.vm.availableThemes).toEqual([
          {
            id: ReportingTopic.HouseholdPrimary,
            name: 'reporting.query.theme.HouseholdPrimary',
            description: 'reporting.query.theme.HouseholdPrimary.description',
          },
        ]);
      });
    });

    describe('queryItems', () => {
      it('calls helper and orders', async () => {
        sharedHelpers.filterCollectionByValue = jest.fn((items) => items);
        await doMount();
        await wrapper.setData({ params: { search: 'some q' }, options: { sortDesc: [true], sortBy: ['theme'] } });
        const r = wrapper.vm.queryItems;
        expect(sharedHelpers.filterCollectionByValue).toHaveBeenCalledWith(wrapper.vm.items, 'some q');
        expect(r).toEqual(_orderBy(wrapper.vm.items, ['pinned', 'theme'], ['desc', 'desc']));
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('calls loadData and loadState', async () => {
        jest.clearAllMocks();
        wrapper.vm.loadState = jest.fn();
        wrapper.vm.loadData = jest.fn();
        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);

        expect(wrapper.vm.loadState).toHaveBeenCalled();
        expect(wrapper.vm.loadData).toHaveBeenCalled();
      });
    });
  });

  describe('Methods', () => {
    describe('loadData', () => {
      it('calls service and store', async () => {
        sharedHelpers.callSearchInInBatches = jest.fn();
        userAccountMetadataStore.getByIds = jest.fn(() => [mockUserAccountMetadata({ id: '0d22f50a-e1ab-435d-a9f0-cfda502866f4', displayName: 'abc' }),
          mockUserAccountMetadata({ id: 'd9cd254a-f527-4000-95ea-285442253cda', displayName: 'def' })]);
        await doMount();
        jest.clearAllMocks();
        await wrapper.vm.loadData();
        expect(services.queries.fetchByType).toHaveBeenCalledWith(QueryType.Custom);
        const params = sharedHelpers.callSearchInInBatches.mock.calls[0];
        expect(params[0].ids).toEqual(['0d22f50a-e1ab-435d-a9f0-cfda502866f4', 'd9cd254a-f527-4000-95ea-285442253cda']);
        expect(userAccountMetadataStore.getByIds).toHaveBeenLastCalledWith(['0d22f50a-e1ab-435d-a9f0-cfda502866f4', 'd9cd254a-f527-4000-95ea-285442253cda']);
        expect(wrapper.vm.items).toEqual([
          {
            theme: 'reporting.query.theme.HouseholdMembers',
            id: '1',
            name: 'some query',
            sharedBy: 'abc',
          },
          {
            theme: 'reporting.query.theme.HouseholdMembers',
            id: '2',
            name: 'second',
            sharedBy: 'abc',
          },
          {
            theme: 'reporting.query.theme.HouseholdPrimary',
            id: '3',
            name: 'mon troisième',
            sharedBy: 'def',
          },
          {
            theme: 'reporting.query.theme.HouseholdPrimary',
            id: '4',
            name: 'mon quatrième',
            sharedBy: 'def',
          },
        ]);
      });
    });

    describe('deleteQuery', () => {
      it('calls deactivate after confirmation', async () => {
        const id = wrapper.vm.queryItems[0].id;
        expect(wrapper.vm.items.find((i) => i.id === id)).toBeTruthy();
        await wrapper.vm.deleteQuery(wrapper.vm.queryItems[0]);
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({
          title: 'reporting.query.confirm.delete.title',
          messages: 'reporting.query.confirm.delete.message',
        });
        expect(services.queries.deactivate).toHaveBeenCalledWith(id);
        expect(wrapper.vm.items.find((i) => i.id === id)).toBeFalsy();
      });
      it('doesnt call deactivate if no confirmation', async () => {
        wrapper.vm.$confirm = jest.fn(() => false);
        await wrapper.vm.deleteQuery(wrapper.vm.queryItems[0]);
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({
          title: 'reporting.query.confirm.delete.title',
          messages: 'reporting.query.confirm.delete.message',
        });
        expect(services.queries.deactivate).toHaveBeenCalledTimes(0);
      });
    });

    describe('getQueryRoute', () => {
      it('should redirect to the query page according to isPbiReport', async () => {
        let result = wrapper.vm.getQueryRoute('abc', false);
        expect(result).toEqual({
          name: routes.reporting.query.name,
          params: {
            queryId: 'abc',
          },
        });
        result = wrapper.vm.getQueryRoute('abc', true);
        expect(result).toEqual({
          name: routes.reporting.powerbi.name,
          params: {
            queryId: 'abc',
          },
        });
      });
    });

    describe('addQuery', () => {
      it('shows theme picker', async () => {
        expect(wrapper.vm.showThemePicker).toBeFalsy();
        wrapper.vm.addQuery();
        expect(wrapper.vm.showThemePicker).toBeTruthy();
      });
    });

    describe('submitAddQuery', () => {
      it('hides theme picker and navigates', async () => {
        await wrapper.setData({ showThemePicker: true, selectedTheme: 1 });
        wrapper.vm.submitAddQuery();
        expect(wrapper.vm.showThemePicker).toBeFalsy();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.reporting.newQuery.name,
          params: {
            theme: '1',
          },
        });
      });
    });
  });
});
