import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockItems } from '@libs/entities-lib/financial-assistance';
import { mockCaseFinancialAssistancePaymentGroups, ApprovalStatus } from '@libs/entities-lib/financial-assistance-payment';
import { Status } from '@libs/shared-lib/types';
import { UserRoles } from '@libs/entities-lib/user';

import Component from '../PaymentLineGroupList.vue';

const localVue = createLocalVue();
const items = mockItems();
const paymentGroups = mockCaseFinancialAssistancePaymentGroups();

describe('PaymentLineGroupList.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: {
        paymentGroups,
        items,
        transactionApprovalStatus: ApprovalStatus.New,
        readonly: false,
      },
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}` && level,
        $hasRole: (r) => r === hasRole,

      },
      ...additionalOverwrites,
    });
    await wrapper.vm.$nextTick();
  };

  describe('Computed', () => {
    describe('total', () => {
      it('should return the total value of paymentGroup when paymentStatus != cancelled', async () => {
        await mountWrapper();
        expect(wrapper.vm.total).toEqual(paymentGroups[0].lines[0].amount);
        const paymentGroup2 = mockCaseFinancialAssistancePaymentGroups()[0];
        paymentGroups.push(paymentGroup2);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.total).toEqual(paymentGroups[0].lines[0].amount * 2);
        paymentGroup2.paymentStatus = 6;
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.total).toEqual(paymentGroups[0].lines[0].amount);
      });

      it('should ignore lines inactive', async () => {
        await mountWrapper();
        paymentGroups[0].lines[0].status = Status.Inactive;
        expect(wrapper.vm.total).toEqual(0);
      });
    });

    describe('canSubmit', () => {
      it('returns true for level1+ if not readonly', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.canSubmit).toBeTruthy();
        await wrapper.setProps({ readonly: true });
        expect(wrapper.vm.canSubmit).toBeFalsy();
        await mountWrapper(false, null);
        expect(wrapper.vm.canSubmit).toBeFalsy();
        await mountWrapper(false, null, UserRoles.readonly);
        expect(wrapper.vm.canSubmit).toBeFalsy();
        await mountWrapper(false, null, UserRoles.contributor3);
        expect(wrapper.vm.canSubmit).toBeFalsy();
        await mountWrapper(false, null, UserRoles.contributorFinance);
        expect(wrapper.vm.canSubmit).toBeFalsy();
      });

      it('returns false when status > new', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.canSubmit).toBeTruthy();
        await wrapper.setProps({ transactionApprovalStatus: ApprovalStatus.Approved });
        expect(wrapper.vm.canSubmit).toBeFalsy();
      });
    });
  });
});
