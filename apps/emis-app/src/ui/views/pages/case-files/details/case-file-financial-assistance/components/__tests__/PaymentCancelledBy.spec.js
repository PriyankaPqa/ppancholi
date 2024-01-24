import { createLocalVue, shallowMount } from '@/test/testSetup';
import { EPaymentCancellationReason } from '@libs/entities-lib/financial-assistance-payment';
import helpers from '@/ui/helpers/helpers';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import Component from '../PaymentCancelledBy.vue';

const localVue = createLocalVue();
const { pinia } = useMockUserAccountStore();

describe('PaymentCancelledBy.vue', () => {
  let wrapper;

  const mountWrapper = async () => {
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      propsData: {
        by: '0d22f50a-e1ab-435d-a9f0-cfda502866f4',
        date: '2021-10-13T14:42:03.6568718Z',
      },
    });
    await wrapper.vm.$nextTick();
  };

  describe('Computed', () => {
    beforeEach(async () => {
      jest.clearAllMocks();

      await mountWrapper();
    });

    describe('cancellationByText', () => {
      it('should return the name and date of cancellation', () => {
        const c = wrapper.vm.cancellationByText;
        expect(c).toEqual({ key: 'caseFile.financialAssistance.cancellationReason.byOn', params: [{ by: 'Jane Smith', on: 'Oct 13, 2021' }] });
        expect(wrapper.vm.$t).toHaveBeenCalledWith(
          'caseFile.financialAssistance.cancellationReason.byOn',
          { by: 'Jane Smith', on: helpers.getLocalStringDate(wrapper.vm.date, 'IFinancialAssistancePaymentGroup.cancellationDate', 'PP') },
        );
      });

      it('should have correct label if it is line cancellation', async () => {
        await wrapper.setProps({ isLineLevel: true });
        const c = wrapper.vm.cancellationByText;
        expect(c).toEqual({ key: 'caseFile.financialAssistance.cancellationReason.lineByOn', params: [{ by: 'Jane Smith', on: 'Oct 13, 2021' }] });
        expect(wrapper.vm.$t).toHaveBeenCalledWith(
          'caseFile.financialAssistance.cancellationReason.lineByOn',
          { by: 'Jane Smith', on: helpers.getLocalStringDate(wrapper.vm.date, 'IFinancialAssistancePaymentGroup.cancellationDate', 'PP') },
        );
      });
    });

    describe('cancellationReasonText', () => {
      it('should return the reason of cancellation if one was provided', async () => {
        let c = wrapper.vm.cancellationReasonText;
        expect(c).toBeNull();
        await wrapper.setProps({ reason: EPaymentCancellationReason.AdminCancellation0 });
        c = wrapper.vm.cancellationReasonText;
        expect(c).toEqual('caseFile.financialAssistance.cancellationReason.reason 0 - Admin cancellation');
      });
    });
  });
});
