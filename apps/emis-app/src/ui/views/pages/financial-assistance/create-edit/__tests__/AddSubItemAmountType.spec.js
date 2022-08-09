import { createLocalVue, mount } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import { mockSubItems } from '@libs/entities-lib/financial-assistance';
import Component from '../Templates/AddSubItemAmountType.vue';

const localVue = createLocalVue();
const storage = mockStorage();

const subItem = mockSubItems()[0];
storage.financialAssistance.getters.newSubItem = jest.fn(() => subItem);

describe('AddSubItemAmountType.vue', () => {
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
          },
          {
            text: 'Variable',
            value: 2,
          },
        ]);
      });
    });
  });
});
