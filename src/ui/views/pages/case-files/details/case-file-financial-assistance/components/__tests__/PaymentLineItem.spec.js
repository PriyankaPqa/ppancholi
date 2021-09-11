import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockItems } from '@/entities/financial-assistance';
import { mockStorage } from '@/store/storage';
import Component from '../PaymentLineItem.vue';
import { EPaymentModalities } from '@/entities/program/program.types';
import { ApprovalStatus, mockCaseFinancialAssistancePaymentGroups } from '@/entities/financial-assistance-payment';

const localVue = createLocalVue();
const storage = mockStorage();
const items = mockItems();
const paymentGroup = mockCaseFinancialAssistancePaymentGroups()[0];
const cheque = EPaymentModalities.Cheque;
const approvalStatus = ApprovalStatus.New;

describe('CaseFilePaymentLineItem.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    const paymentLine = paymentGroup.lines[0];
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: {
        paymentLine,
        approvalStatus,
        modality: cheque,
        items,
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
      it('it should return the name of the mainItem and subtItem linked to the PaymentLine', async () => {
        await mountWrapper();

        expect(wrapper.vm.title).toEqual("Children's Needs > Children's Supplies");
      });
    });

    describe('showEditButton', () => {
      it('returns true for level1+', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.showEditButton).toBeTruthy();
        await mountWrapper(false, null);
        expect(wrapper.vm.showEditButton).toBeFalsy();
        await mountWrapper(false, null, 'readonly');
        expect(wrapper.vm.showEditButton).toBeFalsy();
        await mountWrapper(false, null, 'contributor3');
        expect(wrapper.vm.showEditButton).toBeFalsy();
        await mountWrapper(false, null, 'contributorFinance');
        expect(wrapper.vm.showEditButton).toBeFalsy();
      });

      it('returns false when status > new', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.showEditButton).toBeTruthy();
        await wrapper.setProps({ transactionApprovalStatus: ApprovalStatus.New });
        expect(wrapper.vm.showEditButton).toBeTruthy();
        await wrapper.setProps({ transactionApprovalStatus: ApprovalStatus.Approved });
        expect(wrapper.vm.showEditButton).toBeFalsy();
      });
    });

    describe('showDeleteButton', () => {
      it('returns true for level1+', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.showDeleteButton).toBeTruthy();
        await mountWrapper(false, null);
        expect(wrapper.vm.showDeleteButton).toBeFalsy();
        await mountWrapper(false, null, 'readonly');
        expect(wrapper.vm.showDeleteButton).toBeFalsy();
        await mountWrapper(false, null, 'contributor3');
        expect(wrapper.vm.showDeleteButton).toBeFalsy();
        await mountWrapper(false, null, 'contributorFinance');
        expect(wrapper.vm.showDeleteButton).toBeFalsy();
      });

      it('returns false when status > new', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.showDeleteButton).toBeTruthy();
        await wrapper.setProps({ transactionApprovalStatus: ApprovalStatus.New });
        expect(wrapper.vm.showDeleteButton).toBeTruthy();
        await wrapper.setProps({ transactionApprovalStatus: ApprovalStatus.Approved });
        expect(wrapper.vm.showDeleteButton).toBeFalsy();
      });
    });
  });

  describe('Methods', () => {
    beforeEach(async () => {
      await mountWrapper();
    });

    describe('onClickEdit', () => {
      it('should emit an edit-payment-line', () => {
        const paymentLine = paymentGroup.lines[0];
        wrapper.vm.onClickEdit();
        expect(wrapper.emitted('edit-payment-line')[0][0]).toEqual(paymentLine);
      });
    });

    describe('onClickDelete', () => {
      it('should not emit an delete-payment-line if disableDeleteButton', async () => {
        await wrapper.setProps({ disableDeleteButton: true });
        await wrapper.vm.onClickDelete();
        expect(wrapper.emitted('delete-payment-line')).toBeUndefined();
      });

      it('should emit an delete-payment-line if confirmed', async () => {
        const paymentLine = paymentGroup.lines[0];
        await wrapper.vm.onClickDelete();
        expect(wrapper.emitted('delete-payment-line')[0][0]).toEqual(paymentLine);
      });

      it('should not emit an delete-payment-line if not confirmed', async () => {
        wrapper.vm.$confirm = jest.fn(() => false);
        await wrapper.vm.onClickDelete();
        expect(wrapper.emitted('delete-payment-line')).toBeUndefined();
      });
    });
  });
});
