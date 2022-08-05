import { createLocalVue, mount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import { mockSubItems, EFinancialFrequency } from '@libs/entities-lib/financial-assistance';
import Component from '../Templates/AddSubItemFrequency.vue';

const localVue = createLocalVue();
const storage = mockStorage();

const subItem = mockSubItems()[0];
storage.financialAssistance.getters.newSubItem = jest.fn(() => subItem);

describe('AddSubItemFrequency.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = mount(Component, {
      localVue,
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Computed', () => {
    describe('frequency', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.frequency).toEqual(subItem.frequency);
      });

      it('sets the right value', async () => {
        wrapper.vm.frequency = EFinancialFrequency.Multiple;

        expect(storage.financialAssistance.mutations.setNewSubItemFrequency).toHaveBeenCalledTimes(1);
        expect(storage.financialAssistance.mutations.setNewSubItemFrequency).toHaveBeenCalledWith(EFinancialFrequency.Multiple);
      });
    });

    describe('frequencies', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.frequencies).toEqual([
          {
            text: 'Multiple',
            value: 2,
          },
          {
            text: 'One time',
            value: 1,
          },
        ]);
      });
    });
  });
});
