import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockSubItems } from '@libs/entities-lib/financial-assistance';
import { useMockFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance.mock';
import Component from '../Templates/AddSubItemMaximum.vue';

const localVue = createLocalVue();
const { pinia, financialAssistanceStore } = useMockFinancialAssistanceStore();

const subItem = mockSubItems()[0];
subItem.maximumAmount = 2.345;
financialAssistanceStore.newSubItem = subItem;

describe('AddSubItemMaximum.vue', () => {
  let wrapper;

  describe('Computed', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      wrapper = shallowMount(Component, {
        localVue,
        pinia,
      });
    });

    describe('maximum', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.maximum).toEqual(subItem.maximumAmount);
      });

      it('sets the right value', async () => {
        jest.clearAllMocks();
        wrapper.vm.maximum = 8;
        expect(financialAssistanceStore.newSubItem.maximumAmount).toEqual(8);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      financialAssistanceStore.newSubItem.maximumAmount = 2.345;
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
      });
    });

    describe('roundMaximum', () => {
      it('rounds the number', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
        });
        wrapper.vm.maximum = 2.345;
        await wrapper.vm.roundMaximum();
        expect(financialAssistanceStore.newSubItem.maximumAmount).toEqual(2.35);
      });
    });
  });
});
