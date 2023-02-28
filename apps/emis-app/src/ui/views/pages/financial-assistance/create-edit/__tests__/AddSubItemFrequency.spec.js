import { createLocalVue, mount } from '@/test/testSetup';
import { mockSubItems, EFinancialFrequency } from '@libs/entities-lib/financial-assistance';
import { useMockFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance.mock';
import Component from '../Templates/AddSubItemFrequency.vue';

const localVue = createLocalVue();
const { pinia, financialAssistanceStore } = useMockFinancialAssistanceStore();

const subItem = mockSubItems()[0];
financialAssistanceStore.newSubItem = subItem;

describe('AddSubItemFrequency.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = mount(Component, {
      localVue,
      pinia,
    });
  });

  describe('Computed', () => {
    describe('frequency', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.frequency).toEqual(subItem.frequency);
      });

      it('sets the right value', async () => {
        wrapper.vm.frequency = EFinancialFrequency.Multiple;

        expect(financialAssistanceStore.newSubItem.frequency).toEqual(EFinancialFrequency.Multiple);
      });
    });

    describe('frequencies', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.frequencies).toEqual([
          {
            text: 'Multiple',
            value: 2,
            dataTest: 'Multiple',
          },
          {
            text: 'One time',
            value: 1,
            dataTest: 'OneTime',
          },
        ]);
      });
    });
  });
});
