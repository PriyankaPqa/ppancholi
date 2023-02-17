import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import {
  mockCaseFinancialAssistancePaymentGroups, PaymentStatus,
} from '@libs/entities-lib/financial-assistance-payment';
import { EPaymentModalities } from '@libs/entities-lib/program';
import Component from '../PaymentStatusHistoryDialog.vue';

const localVue = createLocalVue();

describe('ApprovalHistoryDialog.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    jest.clearAllMocks();

    const paymentGroup = mockCaseFinancialAssistancePaymentGroups()[0];
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: {
        paymentGroup,
        show: true,
      },
      data() {
        return {
          EPaymentModalities,
        };
      },
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}` && level,
        $hasRole: (r) => r === hasRole,
      },
      ...additionalOverwrites,
    });
    await wrapper.vm.$nextTick();
  };

  describe('Template', () => {
    beforeEach(async () => {
      await mountWrapper();
    });

    describe('payment-modality', () => {
      it('shows the correct data', () => {
        expect(wrapper.findDataTest('payment-modality').text()).toEqual(`enums.PaymentModality.${EPaymentModalities[wrapper.vm.paymentGroup.groupingInformation.modality]}`);
      });
    });
  });

  describe('Computed', () => {
    describe('headers', () => {
      it('returns the 4 columns', async () => {
        await mountWrapper();
        const { headers } = wrapper.vm;
        expect(headers.length).toBe(4);
        expect(headers.map((h) => h.value)).toEqual(['userInformation.userName', 'dateOfAction', 'actualDateOfAction', 'paymentStatusText']);
      });
    });

    describe('paymentStatusHistory', () => {
      it('returns the right data', async () => {
        await mountWrapper();
        const expectResult = [];
        wrapper.vm.paymentGroup.paymentStatusHistory.forEach((e) => {
          const paymentStatusHistoryItem = {
            ...e,
            paymentStatusText: wrapper.vm.$t(`enums.paymentStatus.${PaymentStatus[e.paymentStatus]}`),
          };
          expectResult.push(paymentStatusHistoryItem);
        });
        expect(wrapper.vm.paymentStatusHistory).toEqual(expectResult);
      });
    });
  });
});
