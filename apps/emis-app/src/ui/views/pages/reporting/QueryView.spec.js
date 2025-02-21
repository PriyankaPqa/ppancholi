import { createLocalVue, shallowMount } from '@/test/testSetup';
import { createTestingPinia } from '@pinia/testing';
import { mockProvider } from '@/services/provider';
import flushPromises from 'flush-promises';
import { useMockUserStore } from '@/pinia/user/user.mock';
import {
  QueryType,
} from '@libs/entities-lib/reporting';
import { locale, loadMessages } from 'devextreme/localization';
import { exportDataGrid } from 'devextreme/excel_exporter';
import frMessages from 'devextreme/localization/messages/fr.json';
import enMessages from 'devextreme/localization/messages/en.json';
import libHelpers from '@libs/component-lib/helpers';
import helpers from '@/ui/helpers/helpers';
import Component from './QueryView.vue';
import {
  LookupType,
} from './datasources';

const localVue = createLocalVue();

const pinia = createTestingPinia({ stubActions: false });
const userStore = useMockUserStore(pinia).userStore;
let services = mockProvider();
jest.mock('devextreme/localization', () => ({ locale: jest.fn(), loadMessages: jest.fn() }));
jest.mock('devextreme/excel_exporter', () => ({ exportDataGrid: jest.fn(() => Promise.resolve()) }));
jest.mock('file-saver');

userStore.getUserId = jest.fn(() => 'user-1');
window.atob = jest.fn(() => null);
window.btoa = jest.fn(() => 'encrypted');
const AllReports = [{
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
  topic: 1,
  state: 'state',
}];

jest.mock('./standard_queries/standard_queries', () => ({ AllReports }));

describe('QueryView.vue', () => {
  let wrapper;

  // eslint-disable-next-line max-params
  const doMount = async (queryId = null, theme = '1', level = 5, role = '', otherComputed = {}) => {
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      computed: {
        ...otherComputed,
      },
      propsData: { queryId, theme },
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

  describe('Computed', () => {
    describe('queryType', () => {
      it('returns the correct QueryType', async () => {
        expect(wrapper.vm.queryType).toEqual(QueryType.Custom);
        await wrapper.setProps({ queryTypeName: 'StandardL6' });
        expect(wrapper.vm.queryType).toEqual(QueryType.StandardL6en);
      });
    });

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

    describe('canShare', () => {
      it('returns true for L5+ or contributorIM', async () => {
        await doMount(null, '1', 5);
        expect(wrapper.vm.canShare).toBeTruthy();
        await doMount(null, '1', 4);
        expect(wrapper.vm.canShare).toBeFalsy();
        await doMount(null, '1', null, 'contributorIM');
        expect(wrapper.vm.canShare).toBeTruthy();
      });
    });
  });

  describe('Lifecycle', () => {
    describe('mounted', () => {
      it('calls bindquery', async () => {
        wrapper.vm.bindQuery = jest.fn();
        jest.clearAllMocks();

        const hook = wrapper.vm.$options.mounted[wrapper.vm.$options.mounted.length - 1];
        await hook.call(wrapper.vm);

        expect(wrapper.vm.bindQuery).toHaveBeenCalledWith(true);
      });

      it('calls setElementA11yAttributeWithDelay', async () => {
        wrapper.vm.setElementA11yAttributeWithDelay = jest.fn();
        jest.clearAllMocks();

        const hook = wrapper.vm.$options.mounted[wrapper.vm.$options.mounted.length - 1];
        await hook.call(wrapper.vm);

        expect(wrapper.vm.setElementA11yAttributeWithDelay).toHaveBeenCalled();
      });
    });
  });

  describe('methods', () => {
    describe('bindQuery', () => {
      it('if initial load it initializes the grid and downloads the query if id was passed', async () => {
        wrapper.vm.initializeGrid = jest.fn();

        await wrapper.vm.bindQuery(true);

        expect(services.queries.get).not.toHaveBeenCalled();
        expect(wrapper.vm.initializeGrid).toHaveBeenCalled();
        jest.clearAllMocks();
        await wrapper.setProps({ queryId: 'some id' });

        await wrapper.vm.bindQuery(true);

        expect(wrapper.vm.initializeGrid).toHaveBeenCalled();
        expect(services.queries.get).toHaveBeenCalledWith(wrapper.vm.queryId);
      });

      it('if initial load it initializes the grid and downloads the query if id was passed', async () => {
        wrapper.vm.initializeGrid = jest.fn();

        await wrapper.vm.bindQuery(true);

        expect(services.queries.get).not.toHaveBeenCalled();
        expect(wrapper.vm.initializeGrid).toHaveBeenCalled();
        jest.clearAllMocks();
        await wrapper.setProps({ queryId: 'some id' });

        await wrapper.vm.bindQuery(true);

        expect(wrapper.vm.initializeGrid).toHaveBeenCalled();
        expect(services.queries.get).toHaveBeenCalledWith(wrapper.vm.queryId);
      });

      it('if not initial load then doesnt go to service', async () => {
        wrapper.vm.initializeGrid = jest.fn();

        await wrapper.vm.bindQuery(false);

        expect(services.queries.get).not.toHaveBeenCalled();
        expect(wrapper.vm.initializeGrid).toHaveBeenCalled();
        jest.clearAllMocks();
        await wrapper.setProps({ queryId: 'some id' });

        await wrapper.vm.bindQuery(false);

        expect(services.queries.get).not.toHaveBeenCalled();
        expect(wrapper.vm.initializeGrid).toHaveBeenCalled();
      });

      it('loads from AllReports if not custom query', async () => {
        wrapper.vm.initializeGrid = jest.fn();
        jest.clearAllMocks();
        await wrapper.setProps({ queryTypeName: 'StandardL6', queryId: 'second en' });

        await wrapper.vm.bindQuery(true);

        expect(wrapper.vm.initializeGrid).toHaveBeenCalled();
        expect(services.queries.get).not.toHaveBeenCalled();
        expect(wrapper.vm.query).toEqual(AllReports[2]);
      });
    });

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
          'caseFileId',
          'memberId',
        ]);
        expect(wrapper.vm.columns.slice(0, 3)).toEqual(
          [{
            allowSearch: true,
            caption: 'ds.casefile.caseFileNumber',
            cssClass: 'grid-column ',
            dataField: 'casefile.caseFileNumber',
            dataType: 'string',
            filterOperations: ['contains', 'notcontains', 'startswith', 'endswith', '=', '<>', 'isblank', 'isnotblank'],
          },
          {
            allowSearch: false,
            caption: 'ds.casefile.caseFileStatusEn',
            cssClass: 'grid-column ',
            dataField: 'casefile.caseFileStatusEn',
            dataType: 'string',
            lookup: { dataSource: [] },
            lookupKey: 'CaseFileStatus',
            lookupType: 0,
            visible: false,
          },
          {
            allowSearch: false,
            caption: 'ds.casefile.caseFileStatusFr',
            cssClass: 'grid-column ',
            dataField: 'casefile.caseFileStatusFr',
            dataType: 'string',
            lookup: { dataSource: [] },
            lookupKey: 'CaseFileStatus',
            lookupType: 1,
            visible: false,
          },
          ],
        );
      });
    });

    describe('initializeLookups', () => {
      it('initializes enum columns', async () => {
        const columns = [
          { dataField: 'activityTypeEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'AccessLevels' },
          { dataField: 'activityTypeFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'AccessLevels' },
          { dataField: 'dateOfChange', dataType: 'datetime', visible: true },
        ];
        await wrapper.vm.initializeLookups(columns);
        expect(columns).toEqual(
          [
            {
              dataField: 'activityTypeEn',
              dataType: 'string',
              lookup: {
                dataSource: [
                  'Level1',
                  'Level2',
                  'Level3',
                  'NoAccess',
                ],
              },
              lookupKey: 'AccessLevels',
              lookupType: 0,
              visible: false,
            },
            {
              dataField: 'activityTypeFr',
              dataType: 'string',
              lookup: {
                dataSource: [
                  'Accès non autorisé',
                  'Niveau d’accès1',
                  'Niveau d’accès2',
                  'Niveau d’accès3',
                ],
              },
              lookupKey: 'AccessLevels',
              lookupType: 1,
              visible: false,
            },
            {
              dataField: 'dateOfChange',
              dataType: 'datetime',
              filterOperations: ['=', '<>', '<', '>', '<=', '>=', 'between', 'isblank', 'isnotblank'],
              visible: true,
            },
          ],
        );
      });

      it('initializes listoptions columns', async () => {
        const columns = [
          { dataField: 'itemNameEn', dataType: 'string', visible: false, lookupType: LookupType.optionItemEn, lookupKey: 'FinancialAssistanceCategory' },
          { dataField: 'itemNameFr', dataType: 'string', visible: false, lookupType: LookupType.optionItemFr, lookupKey: 'FinancialAssistanceCategory' },
          { dataField: 'subItemNameEn', dataType: 'string', visible: false, lookupType: LookupType.optionItemEn, lookupKey: 'FinancialAssistanceCategory', lookupSubItems: true },
          { dataField: 'subItemNameFr', dataType: 'string', visible: false, lookupType: LookupType.optionItemFr, lookupKey: 'FinancialAssistanceCategory', lookupSubItems: true },
          { dataField: 'dateOfChange', dataType: 'datetime', visible: true },
        ];
        await wrapper.vm.initializeLookups(columns);
        expect(columns).toEqual(
          [
            {
              dataField: 'itemNameEn',
              dataType: 'string',
              lookup: {
                dataSource: [
                  'Accommodation',
                ],
              },
              lookupKey: 'FinancialAssistanceCategory',
              lookupType: 2,
              visible: false,
            },
            {
              dataField: 'itemNameFr',
              dataType: 'string',
              lookup: {
                dataSource: [
                  'Hébergement',
                ],
              },
              lookupKey: 'FinancialAssistanceCategory',
              lookupType: 3,
              visible: false,
            },
            {
              dataField: 'subItemNameEn',
              dataType: 'string',
              lookup: {
                dataSource: [
                  'SubItem EN',
                ],
              },
              lookupKey: 'FinancialAssistanceCategory',
              lookupSubItems: true,
              lookupType: 2,
              visible: false,
            },
            {
              dataField: 'subItemNameFr',
              dataType: 'string',
              lookup: {
                dataSource: [
                  'SubItem Fr',
                ],
              },
              lookupKey: 'FinancialAssistanceCategory',
              lookupSubItems: true,
              lookupType: 3,
              visible: false,
            },
            {
              dataField: 'dateOfChange',
              dataType: 'datetime',
              filterOperations: ['=', '<>', '<', '>', '<=', '>=', 'between', 'isblank', 'isnotblank'],
              visible: true,
            },
          ],
        );
      });

      it('initializes event columns', async () => {
        const columns = [
          { dataField: 'eventNameEn', dataType: 'string', visible: false, lookupType: LookupType.eventEn },
          { dataField: 'eventNameFr', dataType: 'string', visible: false, lookupType: LookupType.eventFr },
        ];
        await wrapper.vm.initializeLookups(columns);
        expect(columns).toEqual(
          [
            {
              dataField: 'eventNameEn',
              dataType: 'string',
              lookup: {
                dataSource: [
                  'event for Authtencation',
                  'MANITOBA Wilfire 2022',
                  'TEST THIS EVENT',
                ],
              },
              lookupType: 5,
              visible: false,
            },
            {
              dataField: 'eventNameFr',
              dataType: 'string',
              lookup: {
                dataSource: [
                  'event for Authtencation',
                  'MANITOBA Wilfire 2022',
                  'TEST fr',
                ],
              },
              lookupType: 4,
              visible: false,
            },
          ],
        );
      });

      it('initializes program columns', async () => {
        const columns = [
          { dataField: 'eventNameEn', dataType: 'string', visible: false, lookupType: LookupType.programNameEn },
          { dataField: 'eventNameFr', dataType: 'string', visible: false, lookupType: LookupType.programNameFr },
        ];
        await wrapper.vm.initializeLookups(columns);
        expect(columns).toEqual(
          [
            {
              dataField: 'eventNameEn',
              dataType: 'string',
              lookup: {
                dataSource: [
                  'event for Authtencation',
                  'MANITOBA Wilfire 2022',
                  'TEST THIS EVENT',
                ],
              },
              lookupType: 6,
              visible: false,
            },
            {
              dataField: 'eventNameFr',
              dataType: 'string',
              lookup: {
                dataSource: [
                  'event for Authtencation',
                  'MANITOBA Wilfire 2022',
                  'TEST fr',
                ],
              },
              lookupType: 7,
              visible: false,
            },
          ],
        );
      });

      it('sets filterOperations for non lookups', async () => {
        const columns = [
          { dataField: 'str', dataType: 'string', visible: false },
          { dataField: 'date time', dataType: 'datetime', visible: true },
          { dataField: 'date', dataType: 'date', visible: true },
          { dataField: 'bool', dataType: 'boolean', visible: true },
          { dataField: 'number', dataType: 'number', visible: true },
        ];
        await wrapper.vm.initializeLookups(columns);
        expect(columns).toEqual(
          [
            { dataField: 'str', dataType: 'string', visible: false, filterOperations: ['contains', 'notcontains', 'startswith', 'endswith', '=', '<>', 'isblank', 'isnotblank'] },
            { dataField: 'date time', dataType: 'datetime', visible: true, filterOperations: ['=', '<>', '<', '>', '<=', '>=', 'between', 'isblank', 'isnotblank'] },
            { dataField: 'date', dataType: 'date', visible: true, filterOperations: ['=', '<>', '<', '>', '<=', '>=', 'between', 'isblank', 'isnotblank'] },
            { dataField: 'bool', dataType: 'boolean', visible: true, filterOperations: ['=', '<>', 'isblank', 'isnotblank'] },
            { dataField: 'number', dataType: 'number', visible: true, filterOperations: ['=', '<>', '<', '>', '<=', '>=', 'between', 'isblank', 'isnotblank'] },
          ],
        );
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
        expect(wrapper.vm.shareAfterSave).toBeFalsy();

        await wrapper.setData({ showSaveDialog: false, queryName: 'some name' });
        wrapper.vm.saveQuery();
        expect(wrapper.vm.doSave).not.toHaveBeenCalled();
        expect(wrapper.vm.showSaveDialog).toBeTruthy();
        expect(wrapper.vm.queryName).toBeNull();
        expect(wrapper.vm.shareAfterSave).toBeFalsy();

        await wrapper.setData({ showSaveDialog: false, queryName: 'some name', query: { id: 'some id' } });
        wrapper.vm.saveQuery();
        expect(wrapper.vm.doSave).toHaveBeenCalled();
        expect(wrapper.vm.showSaveDialog).toBeFalsy();
        expect(wrapper.vm.shareAfterSave).toBeFalsy();

        wrapper.vm.saveQuery(false, true);
        expect(wrapper.vm.doSave).toHaveBeenCalled();
        expect(wrapper.vm.showSaveDialog).toBeFalsy();
        expect(wrapper.vm.shareAfterSave).toBeTruthy();
      });
    });

    describe('doSave', () => {
      it('sets the query to be saved and calls service', async () => {
        await wrapper.setData({ showSaveDialog: true, queryName: 'new name', grid: { instance: { state: jest.fn(() => 'my new state'), hideColumnChooser: jest.fn() } } });
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

        await wrapper.setData({ grid: { instance: { state: jest.fn(() => 'my other state'), hideColumnChooser: jest.fn() } } });
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

      it('opens dialog if we want to share', async () => {
        await wrapper.setData({ shareAfterSave: false, showSelectUserDialog: false });
        await wrapper.setData({ grid: { instance: { state: jest.fn(() => 'my other state'), hideColumnChooser: jest.fn() } } });
        await wrapper.vm.doSave();
        expect(wrapper.vm.shareAfterSave).toBeFalsy();
        expect(wrapper.vm.showSelectUserDialog).toBeFalsy();

        await wrapper.setData({ shareAfterSave: true });
        await wrapper.vm.doSave();
        expect(wrapper.vm.shareAfterSave).toBeFalsy();
        expect(wrapper.vm.showSelectUserDialog).toBeTruthy();
      });
    });

    describe('onExporting', () => {
      it('calls the export depending on confirmation', async () => {
        wrapper.vm.$refs.exportDialog = { open: jest.fn(() => false) };
        await wrapper.vm.onExporting({ });
        expect(exportDataGrid).not.toHaveBeenCalled();

        wrapper.vm.$refs.exportDialog = { open: jest.fn(() => true) };
        await wrapper.vm.onExporting({ });
        expect(exportDataGrid).toHaveBeenCalled();
      });

      it('should format date cells correctly if dateType is date, and asUtcDate', async () => {
        wrapper.vm.$refs.exportDialog = { open: jest.fn(() => true) };

        const mockComponent = {};
        const mockWorksheet = {};
        const mockExcelCell = {};
        const mockOptions = {
          gridCell: {
            column: { dataType: 'date', asUtcDate: true },
            value: new Date('2023-06-19T00:00:00Z'),
          },
          excelCell: mockExcelCell,
          worksheet: mockWorksheet,
        };

        helpers.getLocalStringDate = jest.fn(() => '2023-06-19');

        await wrapper.vm.onExporting({ component: mockComponent }).then(() => {
          exportDataGrid.mock.calls[0][0].customizeCell(mockOptions);

          expect(helpers.getLocalStringDate).toHaveBeenCalledWith(new Date('2023-06-19T00:00:00Z'), 'Report.Export');
          expect(mockExcelCell.value).toBe('2023-06-19');
        });
      });

      it('should not format date cells correctly if dateType is date, but not asUtcDate', async () => {
        jest.clearAllMocks();
        wrapper.vm.$refs.exportDialog = { open: jest.fn(() => true) };
        const mockComponent = {};
        const mockWorksheet = {};
        const mockExcelCell = { value: new Date('2023-06-19T00:00:00Z').toISOString() };
        const mockOptions = {
          gridCell: {
            column: { dataType: 'date', asUtcDate: false },
            value: new Date('2023-06-19T00:00:00Z'),
          },
          excelCell: mockExcelCell,
          worksheet: mockWorksheet,
        };
        helpers.getLocalStringDate = jest.fn();

        await wrapper.vm.onExporting({ component: mockComponent }).then(() => {
          exportDataGrid.mock.calls[0][0].customizeCell(mockOptions);

          expect(helpers.getLocalStringDate).not.toHaveBeenCalled();
          expect(mockExcelCell.value).toBe(new Date('2023-06-19T00:00:00Z').toISOString());
        });
      });

      it('should not format non-date type cells', async () => {
        jest.clearAllMocks();
        wrapper.vm.$refs.exportDialog = { open: jest.fn(() => true) };
        const mockComponent = {};
        const mockWorksheet = {};
        const mockExcelCell = { value: 'random-mock-string' };
        const mockOptions = {
          gridCell: {
            column: { dataType: 'string' },
            value: 'random-mock-string',
          },
          excelCell: mockExcelCell,
          worksheet: mockWorksheet,
        };
        helpers.getLocalStringDate = jest.fn();

        await wrapper.vm.onExporting({ component: mockComponent }).then(() => {
          exportDataGrid.mock.calls[0][0].customizeCell(mockOptions);

          expect(helpers.getLocalStringDate).not.toHaveBeenCalled();
          expect(mockExcelCell.value).toBe('random-mock-string');
        });
      });

      it('should not format date cells if value is not a Date', async () => {
        wrapper.vm.$refs.exportDialog = { open: jest.fn(() => true) };

        const mockComponent = {};
        const mockWorksheet = {};
        const mockExcelCell = { value: 'random-mock-string' };
        const mockOptions = {
          gridCell: {
            column: { dataType: 'date', asUtcDate: true },
            value: 'random-mock-string',
          },
          excelCell: mockExcelCell,
          worksheet: mockWorksheet,
        };

        await wrapper.vm.onExporting({ component: mockComponent }).then(() => {
          exportDataGrid.mock.calls[0][0].customizeCell(mockOptions);

          expect(helpers.getLocalStringDate).not.toHaveBeenCalled();
          expect(mockExcelCell.value).toBe('random-mock-string');
        });
      });
    });

    describe('shareToUsers', () => {
      it('calls the service with the query owners', async () => {
        await wrapper.setData({ showSelectUserDialog: true });
        await wrapper.vm.shareToUsers([{ id: 'abc' }, { id: 'def' }]);
        expect(services.queries.create).toHaveBeenCalledWith(
          {
            ...wrapper.vm.query,
            id: null,
            owner: 'abc',
          },
        );
        expect(services.queries.create).toHaveBeenCalledWith(
          {
            ...wrapper.vm.query,
            id: null,
            owner: 'def',
          },
        );
      });
    });

    describe('setElementA11yAttributeWithDelay', () => {
      it('should call helpers setElementA11yAttribute with proper params', async () => {
        libHelpers.setElementA11yAttribute = jest.fn();
        helpers.timeout = jest.fn();
        await wrapper.vm.setElementA11yAttributeWithDelay();
        expect(helpers.timeout).toHaveBeenCalled();
        expect(libHelpers.setElementA11yAttribute).toHaveBeenNthCalledWith(
          1,
          '.dx-item.dx-menu-item.dx-menu-item-has-icon.dx-menu-item-has-submenu',
          'aria-label',
          'common.search',
        );
        expect(libHelpers.setElementA11yAttribute).toHaveBeenNthCalledWith(2, '.dx-widget.dx-state-readonly.dx-checkbox.dx-datagrid-checkbox-size', 'aria-label', 'checkbox');
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
