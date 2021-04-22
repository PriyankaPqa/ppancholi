import { createLocalVue, mount } from '@/test/testSetup';
import { RcDataTable } from '@crctech/component-library';
import routes from '@/constants/routes';
import { mockStorage } from '@/store/storage';

import { mockCaseFilesSearchData, CaseFile } from '@/entities/case-file';
import Component from './CaseFilesTable.vue';

const mockCaseFiles = () => mockCaseFilesSearchData().map((ev) => new CaseFile(ev));

const localVue = createLocalVue();

describe('CaseFilesTable.vue', () => {
  let wrapper;
  const mockParams = {
    id: 'test-id',
  };

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
      });

      wrapper.vm.azureSearchItems = mockCaseFiles();
      wrapper.vm.azureSearchCount = mockCaseFiles().length;

      wrapper.vm.getCaseFileRoute = jest.fn(() => ({
        name: routes.caseFile.activity.name,
        params: mockParams,
      }));

      wrapper.vm.getBeneficiaryRoute = jest.fn(() => ({
        name: routes.caseFile.beneficiaryProfile.name,
        params: mockParams,
      }));
    });

    describe('data table', () => {
      let dataTable;
      beforeEach(() => {
        dataTable = wrapper.findComponent(RcDataTable);
      });

      it('renders', () => {
        expect(dataTable.exists()).toBeTruthy();
      });

      it('displays the correct header values', () => {
        const headers = wrapper.findAll('th');

        expect(headers.length).toBe(6);

        expect(headers.wrappers[0].find('span').text()).toBe('caseFileTable.tableHeaders.caseFileNumber');
        expect(headers.wrappers[1].find('span').text()).toBe('caseFilesTable.tableHeaders.name');
        expect(headers.wrappers[2].find('span').text()).toBe('caseFilesTable.tableHeaders.event');
        expect(headers.wrappers[3].find('span').text()).toBe('caseFilesTable.tableHeaders.triage');
        expect(headers.wrappers[4].find('span').text()).toBe('caseFilesTable.tableHeaders.status');
        expect(headers.wrappers[5].find('span').text()).toBe('caseFilesTable.tableHeaders.createdDate');
      });

      describe('help button', () => {
        it('displays the help button ', async () => {
          wrapper.vm.helpLink = 'mock-help-data-url';
          await wrapper.vm.$nextTick();
          expect(dataTable.props('showHelp')).toBe(true);
          expect(dataTable.props('helpLink')).toEqual('mock-help-data-url');
        });
      });
    });

    describe('table elements', () => {
      test('case file number redirects to getCaseFileRoute', () => {
        const link = wrapper.findDataTest('caseFileDetail-link');
        expect(link.props('to')).toEqual({
          name: routes.caseFile.activity.name,
          params: mockParams,
        });
      });

      test('name redirects to getBeneficiaryRoute', () => {
        const link = wrapper.findDataTest('beneficiaryName-link');
        expect(link.props('to')).toEqual({
          name: routes.caseFile.beneficiaryProfile.name,
          params: mockParams,
        });
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        store: {
          caseFile: {
            searchLoading: false,
          },
        },
      });

      wrapper.vm.azureSearchItems = mockCaseFiles();
      wrapper.vm.azureSearchCount = mockCaseFiles().length;
    });

    describe('customColumns', () => {
      it('should return the correct column names', () => {
        wrapper = mount(Component, {
          localVue,
          computed: {
            locale() { return 'En'; },
          },
        });
        const expectedColumns = {
          caseFileNumber: 'CaseFileNumber',
          name: 'Beneficiary/FirstName',
          event: 'Event/Name/Translation/En',
          triage: 'TriageName/Translation/En',
          status: 'CaseFileStatusName/Translation/En',
          created: 'CaseFileCreatedDate',
        };

        expect(wrapper.vm.customColumns).toEqual(expectedColumns);
      });
    });

    describe('headers', () => {
      it('returns the correct headers data', () => {
        wrapper = mount(Component, {
          localVue,

          propsData: {
            isDashboard: false,
          },
          computed: {
            customColumns() {
              return {
                caseFileNumber: 'CaseFileNumber',
                name: 'Beneficiary/FirstName',
                event: 'Event/Name/Translation/En',
                triage: 'TriageName/Translation/En',
                status: 'CaseFileStatusName/Translation/En',
                created: 'CaseFileCreatedDate',
              };
            },
          },
        });

        expect(wrapper.vm.headers).toEqual([
          {
            text: 'caseFileTable.tableHeaders.caseFileNumber',
            sortable: true,
            value: 'CaseFileNumber',
          },
          {
            text: 'caseFilesTable.tableHeaders.name',
            sortable: true,
            value: 'Beneficiary/FirstName',
          },
          {
            text: 'caseFilesTable.tableHeaders.event',
            sortable: true,
            value: 'Event/Name/Translation/En',
          },
          {
            text: 'caseFilesTable.tableHeaders.triage',
            sortable: true,
            value: 'TriageName/Translation/En',
          },
          {
            text: 'caseFilesTable.tableHeaders.status',
            sortable: true,
            value: 'CaseFileStatusName/Translation/En',
          },
          {
            text: 'caseFilesTable.tableHeaders.createdDate',
            sortable: true,
            value: 'CaseFileCreatedDate',
          },
        ]);
      });
    });

    describe('labels', () => {
      it('returns the right labels', () => {
        expect(wrapper.vm.labels).toEqual({
          header: {
            title: `caseFiles_table.title (${mockCaseFiles().length})`,
            searchPlaceholder: 'common.inputs.quick_search',
          },
        });
      });
    });

    describe('locale', () => {
      it('should return the current locale with the first letter capitalized', () => {
        wrapper.$i18n = { locale: 'en' };
        expect(wrapper.vm.locale).toEqual('En');
      });
    });

    describe('tableProps', () => {
      it('returns the correct object', () => {
        expect(wrapper.vm.tableProps).toEqual({
          loading: false,
        });
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      const storage = mockStorage();

      storage.caseFile.actions.searchCaseFiles = jest.fn(() => ({
        value: mockCaseFiles(),
        odataContext: '',
        odataCount: mockCaseFiles().length,
      }));

      wrapper = mount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });

      wrapper.vm.azureSearchItems = mockCaseFiles();
      wrapper.vm.azureSearchCount = mockCaseFiles().length;
    });

    describe('fetchData', () => {
      let params;

      beforeEach(() => {
        params = {
          search: 'query', filter: 'filter', top: 10, skip: 10, orderBy: 'name asc',
        };
      });

      it('should call storage actions with proper parameters', async () => {
        await wrapper.vm.fetchData(params);

        expect(wrapper.vm.$storage.caseFile.actions.searchCaseFiles).toHaveBeenCalledWith({
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

      it('returns the search results', async () => {
        const res = await wrapper.vm.fetchData(params);
        expect(res.value).toEqual(mockCaseFiles());
      });
    });

    describe('getBeneficiaryRoute', () => {
      it('returns the right route object', () => {
        expect(wrapper.vm.getBeneficiaryRoute(mockCaseFiles()[0])).toEqual({
          name: routes.caseFile.beneficiaryProfile.name,
          params: {
            id: mockCaseFiles()[0].beneficiary.id,
          },
        });
      });
    });

    describe('getCaseFileRoute', () => {
      it('returns the right route object', () => {
        expect(wrapper.vm.getCaseFileRoute(mockCaseFiles()[0])).toEqual({
          name: routes.caseFile.activity.name,
          params: {
            id: mockCaseFiles()[0].id,
          },
        });
      });
    });
  });
});
