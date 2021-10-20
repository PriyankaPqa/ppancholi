import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockFinancialPaymentHistory, mockCaseFinancialAssistanceEntity } from '@/entities/financial-assistance-payment';
import { mockStorage } from '@/store/storage';
import Component from '../ApprovalHistoryDialog.vue';

const localVue = createLocalVue();
const storage = mockStorage();
let financialAssistance = mockCaseFinancialAssistanceEntity();

describe('ApprovalHistoryDialog.vue', () => {
  let wrapper;
  storage.financialAssistancePayment.actions.fetchHistory = jest.fn(() => mockFinancialPaymentHistory());

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    jest.clearAllMocks();

    financialAssistance = mockCaseFinancialAssistanceEntity();
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: {
        financialAssistance,
        show: true,
      },
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}` && level,
        $hasRole: (r) => r === hasRole,
        $storage: storage,
      },
      ...additionalOverwrites,
    });
    await wrapper.vm.$nextTick();
  };

  describe('Template', () => {
    beforeEach(async () => {
      await mountWrapper();
    });

    describe('fa-name', () => {
      it('shows the correct data', () => {
        expect(wrapper.findDataTest('fa-name').text()).toEqual(financialAssistance.name);
      });
    });
  });

  describe('Computed', () => {
    describe('headers', () => {
      it('returns the 4 columns', async () => {
        await mountWrapper();
        const { headers } = wrapper.vm;
        expect(headers.length).toBe(4);
        expect(headers.map((h) => h.value)).toEqual(['username', 'rationale', 'date', 'action']);
      });
    });

    describe('formattedHistory', () => {
      it('returns this data (temporarily...) - to fix when new specs arrive...', async () => {
        await mountWrapper();
        expect(wrapper.vm.formattedHistory).toEqual([
          {
            username: 'Thi Hung Lieu',
            roleName: 'System Admin',
            rationale: 'Payment created',
            date: new Date('2021-10-15T14:27:07.000Z'),
            formattedDate: 'Oct 15, 2021',
            action: 'Submitted',
          },
          {
            username: 'System',
            rationale: 'Assistance approved on assessment form or assistance did not require approval',
            formattedDate: 'Oct 15, 2021',
            date: new Date('2021-10-15T14:27:07.000Z'),
            action: 'Approved - Final',
          },
        ]);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('calls storage to fetch history', async () => {
        await mountWrapper();
        expect(storage.financialAssistancePayment.actions.fetchHistory).toHaveBeenCalled();
        expect(wrapper.vm.submittedHistory).toEqual(storage.financialAssistancePayment.actions.fetchHistory()[0]);
      });
    });
  });
});
