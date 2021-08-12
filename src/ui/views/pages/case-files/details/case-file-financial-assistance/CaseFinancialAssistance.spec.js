import { createLocalVue, mount } from '@/test/testSetup';
import { RcDataTable } from '@crctech/component-library';
import { mockStorage } from '@/store/storage';
import { mockFinancialAssistanceTableEntity } from '@/entities/financial-assistance';
import Component from './CaseFinancialAssistance.vue';

const storage = mockStorage();
const localVue = createLocalVue();
const financialAssistance = mockFinancialAssistanceTableEntity();

describe('CaseFinancialAssistance.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();
    storage.financialAssistance.actions.addFinancialAssistance = jest.fn(() => financialAssistance);

    wrapper = mount(Component, {
      localVue,
      mocks: {
        $storage: storage,
      },
      propsData: {},
      computed: {},
    });
  });

  describe('Template', () => {
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

        expect(headers.length).toBe(4);

        expect(headers.wrappers[0].find('span').text()).toBe('caseFilesTable.tableHeaders.name');
        expect(headers.wrappers[1].find('span').text()).toBe('caseFilesTable.filters.createdDate');
        expect(headers.wrappers[2].find('span').text()).toBe('caseFile.financialAssistance.totals');
        expect(headers.wrappers[3].find('span').text()).toBe('caseFile.financialAssistance.approvalStatus');
      });
    });
  });
});
