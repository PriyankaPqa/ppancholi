import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockFinancialPaymentHistory, mockCaseFinancialAssistanceEntity, ApprovalAction } from '@libs/entities-lib/financial-assistance-payment';
import { useMockFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment.mock';

import Component from '../ApprovalHistoryDialog.vue';

const localVue = createLocalVue();

let financialAssistance = mockCaseFinancialAssistanceEntity();

const { pinia, financialAssistancePaymentStore } = useMockFinancialAssistancePaymentStore();

describe('ApprovalHistoryDialog.vue', () => {
  let wrapper;
  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    jest.clearAllMocks();
    financialAssistance = mockCaseFinancialAssistanceEntity();
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: {
        financialAssistance,
        show: true,
      },
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}` && level,
        $hasRole: (r) => r === hasRole,

      },
      ...additionalOverwrites,
    });
    financialAssistancePaymentStore.fetchHistory = jest.fn(() => mockFinancialPaymentHistory());
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
        expect(headers.map((h) => h.value)).toEqual(['submittedBy.userName', 'rationale', 'dateOfApprovalAction', 'actionText']);
      });
    });

    describe('approvalHistoryItems', () => {
      it('returns the right data', async () => {
        await mountWrapper();
        const approvalHistoryItemsWithText = [];
        wrapper.vm.financialAssistance.approvalStatusHistory.forEach((e) => {
          const approvalHistoryItemsWithTextItem = {
            ...e,
            actionText: wrapper.vm.$t(`enums.approvalAction.${ApprovalAction[e.approvalAction]}`),
          };
          approvalHistoryItemsWithText.push(approvalHistoryItemsWithTextItem);
        });
        expect(wrapper.vm.approvalHistoryItems).toEqual(approvalHistoryItemsWithText);
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
        expect(wrapper.vm.getRationaleText(item)).toEqual({ key: 'caseFile.financialAssistance.approvalHistory.rationale.submittedTo', params: [{ user: 'John Smith' }] });
      });

      it('returns the rationale', async () => {
        await mountWrapper();
        expect(wrapper.vm.getRationaleText({ rationale: 'need more info' })).toEqual('need more info');
      });
    });
  });
});
