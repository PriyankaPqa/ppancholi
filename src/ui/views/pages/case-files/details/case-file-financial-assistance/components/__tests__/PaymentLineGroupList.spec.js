import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockItems } from '@/entities/financial-assistance';
import Component from '../PaymentLineGroupList.vue';
import { mockCaseFinancialAssistancePaymentGroups } from '@/entities/financial-assistance-payment';
import { Status } from '@/entities/base';

const localVue = createLocalVue();
const items = mockItems();
const paymentGroups = mockCaseFinancialAssistancePaymentGroups();

describe('PaymentLineGroupList.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = mount(Component, {
      localVue,
      propsData: {
        paymentGroups,
        items,
      },
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          paymentGroups,
          items,
        },
      });
    });

    describe('total', () => {
      it('should return the total value of paymentGroup when paymentStatus != cancelled', async () => {
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
        paymentGroups[0].lines[0].status = Status.Inactive;
        expect(wrapper.vm.total).toEqual(0);
      });
    });
  });
});
