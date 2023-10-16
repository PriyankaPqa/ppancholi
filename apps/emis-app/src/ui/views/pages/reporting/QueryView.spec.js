import { createLocalVue, shallowMount } from '@/test/testSetup';
import { createTestingPinia } from '@pinia/testing';
import { mockProvider } from '@/services/provider';
import flushPromises from 'flush-promises';
import { useMockUserStore } from '@/pinia/user/user.mock';
import {
  QueryType,
} from '@libs/entities-lib/reporting';
import { locale, loadMessages } from 'devextreme/localization';
import frMessages from 'devextreme/localization/messages/fr.json';
import enMessages from 'devextreme/localization/messages/en.json';
import Component from './QueryView.vue';

const localVue = createLocalVue();

const pinia = createTestingPinia({ stubActions: false });
const userStore = useMockUserStore(pinia).userStore;
let services = mockProvider();
jest.mock('devextreme/localization', () => ({ locale: jest.fn(), loadMessages: jest.fn() }));
userStore.getUserId = jest.fn(() => 'user-1');
window.atob = jest.fn(() => null);
window.btoa = jest.fn(() => 'encrypted');

describe('QueryView.vue', () => {
  let wrapper;

  const doMount = async (queryId = null, theme = 1, level = 5, otherComputed = {}) => {
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      computed: {
        ...otherComputed,
      },
      propsData: { queryId, theme },
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}`,
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

  describe('Computed', () => {
    describe('title', () => {
      it('returns the title according to the query', async () => {
        expect(wrapper.vm.title).toBe('reporting.query.title.Custom: reporting.query.theme.HouseholdMembers');
        await wrapper.setData({ query: { name: 'some name', queryType: QueryType.Custom, topic: 1 } });
        expect(wrapper.vm.title).toBe('reporting.query.title.Custom: some name');
      });
    });

    describe('canSave', () => {
      it('returns true for custom queries', async () => {
        expect(wrapper.vm.canSave).toBeTruthy();
        await wrapper.setData({ query: { name: 'some name', queryType: QueryType.StandardL6en, topic: 1 } });
        expect(wrapper.vm.canSave).toBeFalsy();
      });
    });
  });

  describe('Lifecycle', () => {
    describe('mounted', () => {
      it('initializes the grid and downloads the query if id was passed', async () => {
        wrapper.vm.initializeGrid = jest.fn();

        expect(services.queries.get).not.toHaveBeenCalled();
        jest.clearAllMocks();
        await wrapper.setProps({ queryId: 'some id' });

        const hook = wrapper.vm.$options.mounted[wrapper.vm.$options.mounted.length - 1];
        await hook.call(wrapper.vm);

        expect(wrapper.vm.initializeGrid).toHaveBeenCalledWith(true);
        expect(services.queries.get).toHaveBeenCalledWith(wrapper.vm.queryId);
      });
    });
  });

  describe('methods', () => {
    describe('initializeGrid', () => {
      it('initializes the grid and sets language', async () => {
        wrapper.vm.initializeDatasource = jest.fn();
        wrapper.vm.refreshData = jest.fn();
        await wrapper.vm.initializeGrid();
        expect(wrapper.vm.initializeDatasource).toHaveBeenCalled();
        expect(wrapper.vm.refreshData).toHaveBeenCalled();
        expect(loadMessages).toHaveBeenCalledWith(enMessages);
        expect(locale).toHaveBeenCalledWith('en');
        wrapper.vm.$i18n.locale = 'fr';
        await wrapper.vm.initializeGrid();
        expect(wrapper.vm.initializeDatasource).toHaveBeenCalled();
        expect(wrapper.vm.refreshData).toHaveBeenCalled();
        expect(loadMessages).toHaveBeenCalledWith(frMessages);
        expect(locale).toHaveBeenCalledWith('fr');
      });
    });

    describe('initializeDatasource', () => {
      it('initializes select for the datasource based on visible columns and sets columns', async () => {
        await wrapper.vm.initializeDatasource();
        expect(wrapper.vm.dataSource.select).toEqual([
          'casefile.caseFileNumber',
          'household.primaryBeneficiaryFirstName',
          'household.primaryBeneficiaryLastName',
          'person.firstName',
          'person.lastName',
          'id',
        ]);
        expect(wrapper.vm.columns.slice(0, 3)).toEqual([
          {
            allowFiltering: false,
            allowHeaderFiltering: false,
            allowSearch: false,
            caption: 'ds.casefile.id',
            cssClass: 'grid-column',
            dataField: 'casefile.id',
            dataType: 'string',
            visible: false,
          },
          {
            allowSearch: true,
            caption: 'ds.casefile.caseFileNumber',
            cssClass: 'grid-column',
            dataField: 'casefile.caseFileNumber',
            dataType: 'string',
          },
          {
            allowFiltering: false,
            allowHeaderFiltering: false,
            allowSearch: false,
            caption: 'ds.casefile.householdId',
            cssClass: 'grid-column',
            dataField: 'casefile.householdId',
            dataType: 'string',
            visible: false,
          },
        ]);
      });
    });

    describe('saveQuery', () => {
      it('shows dialog if no name or cloning', async () => {
        wrapper.vm.doSave = jest.fn();

        await wrapper.setData({ showSaveDialog: false, queryName: 'some name' });
        wrapper.vm.saveQuery(true);
        expect(wrapper.vm.doSave).not.toHaveBeenCalled();
        expect(wrapper.vm.showSaveDialog).toBeTruthy();
        expect(wrapper.vm.queryName).toBeNull();

        await wrapper.setData({ showSaveDialog: false, queryName: 'some name' });
        wrapper.vm.saveQuery();
        expect(wrapper.vm.doSave).not.toHaveBeenCalled();
        expect(wrapper.vm.showSaveDialog).toBeTruthy();
        expect(wrapper.vm.queryName).toBeNull();

        await wrapper.setData({ showSaveDialog: false, queryName: 'some name', query: { id: 'some id' } });
        wrapper.vm.saveQuery();
        expect(wrapper.vm.doSave).toHaveBeenCalled();
        expect(wrapper.vm.showSaveDialog).toBeFalsy();
      });
    });

    describe('doSave', () => {
      it('sets the query to be saved and calls service', async () => {
        await wrapper.setData({ showSaveDialog: true, queryName: 'new name', grid: { instance: { state: jest.fn(() => 'my new state') } } });
        await wrapper.vm.doSave(true);
        expect(services.queries.create).toHaveBeenCalledWith(
          {
            id: null,
            name: 'new name',
            owner: 'user-1',
            queryType: 1,
            state: 'encrypted',
            topic: 1,
          },
        );
        expect(wrapper.vm.showSaveDialog).toBeFalsy();
        jest.clearAllMocks();

        await wrapper.setData({ grid: { instance: { state: jest.fn(() => 'my other state') } } });
        await wrapper.vm.doSave();
        expect(services.queries.edit).toHaveBeenCalledWith(
          {
            created: '2021-04-06 06:39:04',
            createdBy: '0d22f50a-e1ab-435d-a9f0-cfda502866f4',
            id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f',
            lastAction: 'Created',
            lastActionCorrelationId: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f',
            lastUpdatedBy: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f',
            name: 'some query',
            owner: '0d22f50a-e1ab-435d-a9f0-cfda502866f4',
            queryType: 1,
            state: 'encrypted',
            status: 1,
            tenantId: 'b70bbe71-0683-4a18-bc3e-c9747aafcea3',
            timestamp: '2021-04-06 06:39:04',
            topic: 1,
          },
        );
      });
    });

    /// doesnt work on linux...
    // describe('handlePropertyChange', () => {
    //   it('calls refreshData if a column was changed', async () => {
    //     wrapper.vm.refreshData = jest.fn();
    //     wrapper.vm.handlePropertyChange({ name: 'not a column!' });
    //     expect(wrapper.vm.refreshData).not.toHaveBeenCalled();
    //     wrapper.vm.handlePropertyChange({ name: 'columns' });
    //     expect(wrapper.vm.refreshData).toHaveBeenCalled();
    //   });
    // });
  });
});
