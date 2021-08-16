import { createLocalVue, mount } from '@/test/testSetup';
import { mockProgramCaseFinancialAssistance } from '@/entities/program';
import Component from './CreatePaymentLineDialog.vue';

const localVue = createLocalVue();
const program = mockProgramCaseFinancialAssistance();

describe('CaseFileFinancialAssistancePaymentLineDialog.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();

    wrapper = mount(Component, {
      localVue,
      propsData: {
        show: true,
        program,
      },
    });
  });

  describe('Template', () => {
    describe('payment_title', () => {
      it('is rendered', async () => {
        expect(wrapper.findDataTest('payment_title').exists()).toBeTruthy();
      });
    });

    describe('payement_item', () => {
      it('is rendered', async () => {
        expect(wrapper.findDataTest('payement_item').exists()).toBeTruthy();
      });
    });

    describe('payment_subItem', () => {
      it('is rendered', async () => {
        expect(wrapper.findDataTest('payment_subItem').exists()).toBeTruthy();
      });
    });

    describe('payment_modalities', () => {
      it('is rendered', async () => {
        expect(wrapper.findDataTest('payment_modalities').exists()).toBeTruthy();
      });
    });

    describe('checkbox_consent', () => {
      it('is rendered', async () => {
        expect(wrapper.findDataTest('checkbox_consent').exists()).toBeTruthy();
      });
    });

    describe('reason_specified_other', () => {
      it('is rendered', async () => {
        expect(wrapper.findDataTest('reason_specified_other').exists()).toBeTruthy();
      });
    });
  });

  describe('Validation rules', () => {
    describe('payement_item', () => {
      it('is rendered', async () => {
        const element = wrapper.findDataTest('payement_item');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.item);
      });
    });

    describe('payment_subItem', () => {
      it('is rendered', async () => {
        const element = wrapper.findDataTest('payment_subItem');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.subitem);
      });
    });

    describe('payment_modalities', () => {
      it('is rendered', async () => {
        const element = wrapper.findDataTest('payment_modalities');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.modalities);
      });
    });

    describe('reason_specified_other', () => {
      it('is rendered', async () => {
        const element = wrapper.findDataTest('reason_specified_other');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.amount);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(async () => {
      jest.clearAllMocks();

      wrapper = mount(Component, {
        localVue,
        propsData: {
          show: true,
          program,
        },
      });
    });

    describe('paymentModalities', () => {
      it('should return the list of payment modalities', () => {
        expect(wrapper.vm.paymentModalities).toEqual([
          { value: 2, text: 'Cheque' },
          { value: 3, text: 'Direct deposit' },
          { value: 4, text: 'Gift card' },
          { value: 5, text: 'Invoice' },
          { value: 6, text: 'Prepaid card' },
          { value: 7, text: 'Voucher' },
        ]);
      });
    });
  });

  describe('Methods', () => {
    describe('initCreateMode', () => {
      it('sets the right call centre data', async () => {
        jest.clearAllMocks();
        await wrapper.vm.initCreateMode();
        expect(wrapper.vm.paymentLine).toEqual({
          modality: null,
          payeeType: null,
          payeeName: null,
          lines: null,
        });
      });
    });
  });
});
