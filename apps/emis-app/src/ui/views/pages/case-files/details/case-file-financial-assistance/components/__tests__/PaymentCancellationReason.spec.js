import { createLocalVue, shallowMount } from '@/test/testSetup';
import {
  EPaymentCancellationReason } from '@libs/entities-lib/financial-assistance-payment';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
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

  describe('Template', () => {
    it('show warning if feature flag is on', async () => {
      wrapper = shallowMount(Component, { localVue,
        data() {
          return { cancellationReason: EPaymentCancellationReason.AdminCancellation0 };
        },
        propsData: {
          isLineLevel: true,
        },
        mocks: {
          $hasFeature: (ft) => ft === FeatureKeys.FinancialAssistanceRemovePaymentLine,
        },
      });
      let element = wrapper.findDataTest('paymentGroup__cancellationWarning');
      expect(element.exists()).toBeTruthy();
      expect(element.text()).toContain('caseFile.financialAssistance.cancelPaymentGroup.confirm.message.cancellationReason');
      await wrapper.setProps({ isLineLevel: false });
      element = wrapper.findDataTest('paymentGroup__cancellationWarning');
      expect(element.text()).toContain('caseFile.financialAssistance.cancelPaymentGroup.confirm.message.cancellationReason.lines');
    });
  });
});
