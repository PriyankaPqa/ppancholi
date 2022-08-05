import { createLocalVue, mount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import { mockSubItems } from '@libs/entities-lib/financial-assistance';
import Component from '../Templates/AddSubItemMaximum.vue';

const localVue = createLocalVue();
const storage = mockStorage();

const subItem = mockSubItems()[0];
subItem.maximumAmount = 2.345;
storage.financialAssistance.getters.newSubItem = jest.fn(() => subItem);

describe('AddSubItemMaximum.vue', () => {
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
    describe('maximum', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.maximum).toEqual(subItem.maximumAmount);
      });

      it('sets the right value', async () => {
        jest.clearAllMocks();

        wrapper.vm.maximum = 8;

        expect(storage.financialAssistance.mutations.setNewSubItemMaximum).toHaveBeenCalledTimes(1);
        expect(storage.financialAssistance.mutations.setNewSubItemMaximum).toHaveBeenCalledWith(8);
      });
    });
  });

  describe('Methods', () => {
    describe('roundMaximum', () => {
      it('rounds the number', async () => {
        jest.clearAllMocks();
        wrapper.vm.roundMaximum();

        expect(storage.financialAssistance.mutations.setNewSubItemMaximum).toHaveBeenCalledWith(2.35);
      });
    });
  });
});
