/* eslint-disable */
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockItems } from '@/entities/financial-assistance';
import Component from '../PaymentLineGroup.vue';
import { mockCaseFinancialAssistancePaymentGroups } from '@/entities/financial-assistance-payment';
import { Status } from '@/entities/base';

const localVue = createLocalVue();
const items = mockItems();
let paymentGroup = mockCaseFinancialAssistancePaymentGroups()[0];

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

  describe('Computed', () => {

    beforeEach(() => {
      jest.clearAllMocks();
      paymentGroup = mockCaseFinancialAssistancePaymentGroups()[0];
  
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          paymentGroup,
          items,
        },
      });
    });

    describe('title', () => {
      it('should return the modality + payeeType + payee name when cheque or deposit', () => {
        expect(wrapper.vm.title).toBe('event.programManagement.paymentModalities.Cheque (enums.payeeType.Beneficiary) - thl');
        wrapper.vm.paymentGroup.groupingInformation = {
          modality: 3,
          payeeType: 2,
          payeeName: 'abc',
        };
        expect(wrapper.vm.title).toBe('event.programManagement.paymentModalities.DirectDeposit (enums.payeeType.ThirdParty) - abc');
      });

      it('should return the modality if it isnt Cheque or Direct deposit', () => {
        expect(wrapper.vm.title).toBe('event.programManagement.paymentModalities.Cheque (enums.payeeType.Beneficiary) - thl');
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
