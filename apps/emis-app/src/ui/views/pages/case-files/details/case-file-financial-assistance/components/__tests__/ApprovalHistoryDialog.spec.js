import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockFinancialPaymentHistory, mockCaseFinancialAssistanceEntity, ApprovalAction } from '@libs/entities-lib/financial-assistance-payment';
import { mockStorage } from '@/storage';
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

    describe('approvalHistoryItems', () => {
      it('returns the right data', async () => {
        await mountWrapper();
        expect(wrapper.vm.approvalHistoryItems).toEqual(wrapper.vm.financialAssistance.approvalStatusHistory);
      });
    });
  });

  describe('Methods', () => {
    describe('getRationaleText', () => {
      it('returns - when there is no rationale', async () => {
        await mountWrapper();
        const item = {
          rationale: null,
          submittedBy: { userId: '11111111-1234-1111-1111-111111111111' },
          approvalAction: ApprovalAction.Submitted,
        };
        expect(wrapper.vm.getRationaleText(item)).toEqual('-');
      });

      it('returns the right text when there is no rationale and the user is system and the approval action is approved final', async () => {
        await mountWrapper();
        const item = {
          rationale: null,
          submittedBy: { userId: '11111111-1111-1111-1111-111111111111' },
          approvalAction: ApprovalAction.ApprovedFinal,
        };
        expect(wrapper.vm.getRationaleText(item)).toEqual('caseFile.financialAssistance.approvalHistory.rationale.approved');
      });

      it('returns the right text when there is no rationale and the action is submitted and it is submitted to someone', async () => {
        await mountWrapper();
        const item = {
          rationale: null,
          submittedBy: { userId: '11111111-1111-1234-1111-111111111111' },
          submittedTo: { userId: '11111111-1234-1111-1111-111111111111', userName: 'John Smith' },
          approvalAction: ApprovalAction.Submitted,
        };
        expect(wrapper.vm.getRationaleText(item)).toEqual('caseFile.financialAssistance.approvalHistory.rationale.submittedTo');
      });

      it('returns the rationale', async () => {
        await mountWrapper();
        expect(wrapper.vm.getRationaleText({ rationale: 'need more info' })).toEqual('need more info');
      });
    });
  });
});
