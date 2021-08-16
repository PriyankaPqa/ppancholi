import { RcDataTable } from '@crctech/component-library';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import Component from './CaseFinancialAssistance.vue';

const storage = mockStorage();
const localVue = createLocalVue();

describe('CaseFinancialAssistance.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      mocks: {
        $hasLevel: (lvl) => (lvl <= `level${level}`) && level,
        $hasRole: (r) => r === hasRole,
        $storage: storage,
      },
      ...additionalOverwrites,
    });
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

        expect(headers.length).toBe(4);

        expect(headers.wrappers[0].find('span').text()).toBe('caseFilesTable.tableHeaders.name');
        expect(headers.wrappers[1].find('span').text()).toBe('caseFilesTable.filters.createdDate');
        expect(headers.wrappers[2].find('span').text()).toBe('caseFile.financialAssistance.totals');
        expect(headers.wrappers[3].find('span').text()).toBe('caseFile.financialAssistance.approvalStatus');
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
  });

  describe('Computed', () => {
    describe('canAdd', () => {
      it('returns true for level1+', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.canAdd).toBeTruthy();
        await mountWrapper(false, null);
        expect(wrapper.vm.canAdd).toBeFalsy();
        await mountWrapper(false, null, 'readonly');
        expect(wrapper.vm.canDelete).toBeFalsy();
        await mountWrapper(false, null, 'contributor3');
        expect(wrapper.vm.canDelete).toBeFalsy();
      });
    });
  });
});
