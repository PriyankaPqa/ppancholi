/* eslint-disable */
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockItems } from '@/entities/financial-assistance';
import Component from '../PaymentLineGroup.vue';
import { mockCaseFinancialAssistancePaymentGroups } from '@/entities/financial-assistance-payment';
import { Status } from '@/entities/base';
import { mockProgramEntity } from '@/entities/program';

const localVue = createLocalVue();
const items = mockItems();
let paymentGroup = mockCaseFinancialAssistancePaymentGroups()[0];
let program = mockProgramEntity();

describe('PaymentLineGroup.vue', () => {
  let wrapper;

  describe('Template', () => {

    beforeEach(() => {
      jest.clearAllMocks();
      paymentGroup = mockCaseFinancialAssistancePaymentGroups()[0];

      wrapper = mount(Component, {
        localVue,
        propsData: {
          paymentGroup,
          items,
          program,
        },
      });
    });

    describe('paymentLineGroup__title', () => {
      it('is rendered', () => {
        expect(wrapper.findDataTest('paymentLineGroup__title').exists()).toBeTruthy();
      });
    });

    describe('paymentLineGroup__total', () => {
      it('renders when not cancelled', async () => {
        expect(wrapper.findDataTest('paymentLineGroup__total').exists()).toBeTruthy();
        wrapper.vm.paymentGroup.paymentStatus = 6;
        await wrapper.vm.$nextTick();
        expect(wrapper.findDataTest('paymentLineGroup__total').exists()).toBeFalsy();
      });
    });

    describe('paymentLineGroup__status', () => {
      it('renders when not new payment', async () => {
        await wrapper.setProps({ transactionApprovalStatus: 1 }); // new
        await wrapper.vm.$nextTick();
        expect(wrapper.findDataTest('paymentLineGroup__status').exists()).toBeFalsy();
        await wrapper.setProps({ transactionApprovalStatus: 2 });
        await wrapper.vm.$nextTick();
        expect(wrapper.findDataTest('paymentLineGroup__status').exists()).toBeTruthy();
      });
    });

    describe('warning paymentLineGroup__paymentMustBeSubmitted', () => {
      it('renders when new payment', async () => {
        await wrapper.setProps({ transactionApprovalStatus: 2 });
        await wrapper.vm.$nextTick();
        expect(wrapper.findDataTest('paymentLineGroup__paymentMustBeSubmitted').exists()).toBeFalsy();
        await wrapper.setProps({ transactionApprovalStatus: 1 }); // new
        await wrapper.vm.$nextTick();
        expect(wrapper.findDataTest('paymentLineGroup__paymentMustBeSubmitted').exists()).toBeTruthy();
      });
    });
  });
  
  describe('Lifecycle', () => {
    describe('created', () => {
      it('shows a message if the data is inactive', async () => {
        paymentGroup = mockCaseFinancialAssistancePaymentGroups()[0];
    
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            paymentGroup,
            items,
            program,
          },
          computed: {
            isInactive() { return true; },
          },
        });

        jest.clearAllMocks();
        let hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.$message).toHaveBeenCalled();

        
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            paymentGroup,
            items,
            program,
          },
          computed: {
            isInactive() { return false; },
          },
        });
        hook = wrapper.vm.$options.created[0];
        jest.clearAllMocks();
        await hook.call(wrapper.vm);
        expect(wrapper.vm.$message).not.toHaveBeenCalled();

      });
    });
  });

  describe('Computed', () => {

    beforeEach(() => {
      jest.clearAllMocks();
      paymentGroup = mockCaseFinancialAssistancePaymentGroups()[0];
  
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          paymentGroup,
          items,
          program,
        },
      });
    });

    describe('title', () => {
      it('should return the modality + payeeType + payee name when cheque', () => {
        expect(wrapper.vm.title).toBe('Cheque (Beneficiary) - thl');
        wrapper.vm.paymentGroup.groupingInformation = {
          modality: 2,
          payeeType: 2,
          payeeName: 'abc',
        };
        expect(wrapper.vm.title).toBe('Cheque (Third-party) - abc');
      });

      it('should return the modality if it isnt Cheque', () => {
        wrapper.vm.paymentGroup.groupingInformation = {
          modality: 1,
          payeeType: 2,
          payeeName: 'abc',
        };
        expect(wrapper.vm.title).toBe('E-Transfer');
      });
    });

    describe('isInactive', () => {
      it('returns whether the current modality is not available when the payment is still new', async () => {
        wrapper.vm.paymentGroup.groupingInformation = { modality: 2 };
        await wrapper.setProps({ transactionApprovalStatus: 1 }); // new
        await wrapper.setProps({ program: { paymentModalities: [1, 2] } });
        expect(wrapper.vm.isInactive).toBeFalsy();
        await wrapper.setProps({ program: { paymentModalities: [1] } });
        expect(wrapper.vm.isInactive).toBeTruthy();
        await wrapper.setProps({ transactionApprovalStatus: 2 });
        await wrapper.setProps({ program: { paymentModalities: [1, 2] } });
        expect(wrapper.vm.isInactive).toBeFalsy();
      });
    });

    describe('activeLines', () => {
      it('should filter out inactive lines', () => {
        paymentGroup.lines = [];
        paymentGroup.lines.push({ amount: 4562.15, status: Status.Active });
        paymentGroup.lines.push({ amount: 123, status: Status.Active });
        paymentGroup.lines.push({ amount: 123.55, status: Status.Inactive });
        expect(wrapper.vm.activeLines).toEqual([paymentGroup.lines[0], paymentGroup.lines[1]]);
      });
    });

    describe('total', () => {
      it('should return the total value of payment group', () => {
        paymentGroup.lines = [];
        paymentGroup.lines.push({ amount: 4562.15, status: Status.Active });
        paymentGroup.lines.push({ amount: 123.55, status: Status.Active });
        expect(wrapper.vm.total).toEqual(4562.15 + 123.55);
      });

      it('should ignore inactive lines', () => {
        paymentGroup.lines = [];
        paymentGroup.lines.push({ amount: 123, status: Status.Active });
        paymentGroup.lines.push({ amount: 123.55, status: Status.Inactive });
        expect(wrapper.vm.total).toEqual(123);
      });
    });

    describe('modality', () => {
      it('should return name of the selected modality in lowercase', () => {
        expect(wrapper.vm.modality).toEqual('event.programmanagement.paymentmodalities.cheque');
      });
    });
  });
});
