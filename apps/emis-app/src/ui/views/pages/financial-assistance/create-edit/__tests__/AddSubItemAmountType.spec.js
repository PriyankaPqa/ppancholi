import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockSubItems } from '@libs/entities-lib/financial-assistance';
import { useMockFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance.mock';
import Component from '../Templates/AddSubItemAmountType.vue';

const localVue = createLocalVue();

const subItem = mockSubItems()[0];
const { financialAssistanceStore, pinia } = useMockFinancialAssistanceStore();

financialAssistanceStore.newSubItem = subItem;

describe('AddSubItemAmountType.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = shallowMount(Component, {
      localVue,
      pinia,
    });
  });

  describe('Computed', () => {
    describe('amountType', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.amountType).toEqual(subItem.amountType);
      });
    });

    describe('amountModes', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.amountModes).toEqual([
          {
            text: 'Fixed',
            value: 1,
            dataTest: 'Fixed',
          },
          {
            text: 'Variable',
            value: 2,
            dataTest: 'Variable',
          },
        ]);
      });
    });
  });
});
