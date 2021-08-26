import { createLocalVue, mount } from '@/test/testSetup';
import { mockItems } from '@/entities/financial-assistance';
import Component from '../PaymentLineItem.vue';
import { EPaymentModalities } from '@/entities/program/program.types';
import { ApprovalStatus, mockCaseFinancialAssistancePaymentGroups } from '@/entities/financial-assistance-payment';

const localVue = createLocalVue();
const items = mockItems();
const paymentGroup = mockCaseFinancialAssistancePaymentGroups()[0];
const cheque = EPaymentModalities.Cheque;
const approvalStatus = ApprovalStatus.New;

describe('CaseFilePaymentLineItem.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      const paymentLine = paymentGroup.lines[0];
      wrapper = mount(Component, {
        localVue,
        propsData: {
          paymentLine,
          approvalStatus,
          modality: cheque,
          items,
        },
      });
    });

    describe('paymentLineItem__editBtn', () => {
      it('is rendered', () => {
        expect(wrapper.findDataTest('paymentLineItem__editBtn').exists()).toBeTruthy();
      });
    });

    describe('paymentLineItem__deleteBtn', () => {
      it('is rendered', () => {
        expect(wrapper.findDataTest('paymentLineItem__deleteBtn').exists()).toBeTruthy();
      });
    });
  });

  describe('Computed', () => {
    describe('title', () => {
      it('it should return the name of the mainItem and subtItem linked to the PaymentLine', () => {
        jest.clearAllMocks();

        const paymentLine = paymentGroup.lines[0];
        wrapper = mount(Component, {
          localVue,
          propsData: {
            paymentLine,
            approvalStatus,
            modality: cheque,
            items,
          },
        });

        expect(wrapper.vm.title).toEqual("Children's Needs > Children's Supplies");
      });
    });
  });

  describe('Methods', () => {
    beforeEach(async () => {
      jest.clearAllMocks();
      const paymentLine = paymentGroup.lines[0];

      wrapper = mount(Component, {
        localVue,
        propsData: {
          paymentLine,
          approvalStatus,
          modality: cheque,
          items,
        },
      });
    });

    describe('onClickEdit', () => {
      it('should emit an edit-payment-line', () => {
        const paymentLine = paymentGroup.lines[0];
        wrapper.vm.onClickEdit();
        expect(wrapper.emitted('edit-payment-line')[0][0]).toEqual(paymentLine);
      });
    });
  });
});
