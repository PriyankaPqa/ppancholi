import { createLocalVue, shallowMount } from '@/test/testSetup';
import {
  EPaymentCancellationReason } from '@libs/entities-lib/financial-assistance-payment';
import Component from '../PaymentCancellationReason.vue';

const localVue = createLocalVue();
describe('PaymentCancellationReason.vue', () => {
  let wrapper;

  describe('Methods', () => {
    beforeEach(async () => {
      jest.clearAllMocks();

      wrapper = shallowMount(Component, { localVue,
        data() {
          return { cancellationReason: EPaymentCancellationReason.AdminCancellation0 };
        },
      });
    });

    describe('onSelectReason', () => {
      it('calls emit with the selected reason', async () => {
        wrapper.vm.$emit = jest.fn();
        await wrapper.vm.onSelectReason();
        expect(wrapper.vm.$emit).toHaveBeenCalledWith('cancel-with-reason', wrapper.vm.cancellationReason);
      });
    });
  });
});
