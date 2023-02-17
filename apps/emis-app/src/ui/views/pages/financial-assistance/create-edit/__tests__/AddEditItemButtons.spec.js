import { createLocalVue, mount } from '@/test/testSetup';

import { mockItems } from '@libs/entities-lib/financial-assistance';
import { useMockFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance.mock';
import Component from '../Templates/AddEditItemButtons.vue';

const localVue = createLocalVue();

const { pinia, financialAssistanceStore } = useMockFinancialAssistanceStore();

describe('AddEditItemButtons.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = mount(Component, {
      localVue,
      pinia,
      propsData: {
        mode: 'add',
        failed: false,
      },
    });
  });

  describe('Computed', () => {
    describe('saveButtonDataTest', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.saveButtonDataTest).toEqual('financialAssistanceItems__confirmAddItemBtn');

        await wrapper.setProps({ mode: 'edit' });

        expect(wrapper.vm.saveButtonDataTest).toEqual('financialAssistanceItems__confirmEditItemBtn');
      });
    });

    describe('cancelButtonDataTest', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.cancelButtonDataTest).toEqual('financialAssistanceItems__cancelAddItemBtn');

        await wrapper.setProps({ mode: 'edit' });

        expect(wrapper.vm.cancelButtonDataTest).toEqual('financialAssistanceItems__cancelEditItemBtn');
      });
    });
  });

  describe('Methods', () => {
    describe('onSave', () => {
      it('calls onAddItem if is add', async () => {
        wrapper.vm.onAddItem = jest.fn();

        expect(wrapper.vm.onAddItem).toHaveBeenCalledTimes(0);

        wrapper.vm.onSave();

        expect(wrapper.vm.onAddItem).toHaveBeenCalledTimes(1);
      });

      it('calls onSaveEditItem if is edit', async () => {
        wrapper.vm.onSaveEditItem = jest.fn();
        await wrapper.setProps({ mode: 'edit' });

        expect(wrapper.vm.onSaveEditItem).toHaveBeenCalledTimes(0);

        wrapper.vm.onSave();

        expect(wrapper.vm.onSaveEditItem).toHaveBeenCalledTimes(1);
      });
    });

    describe('onAddItem', () => {
      it('mutates storage', async () => {
        wrapper.vm.$parent = {
          $parent: {
            $parent: {
              $refs: {
                form: {
                  validate: jest.fn(() => true),
                },
              },
            },
          },
        };

        financialAssistanceStore.addingItem = true;
        await wrapper.vm.onAddItem();

        expect(financialAssistanceStore.addItem).toHaveBeenCalledTimes(1);
        expect(financialAssistanceStore.addingItem).toBeFalsy();
        expect(financialAssistanceStore.resetNewItem).toHaveBeenCalledTimes(1);
      });
    });

    describe('onSaveEditItem', () => {
      it('mutates storage', async () => {
        financialAssistanceStore.newItem = mockItems()[0];
        wrapper.vm.onSaveEditItem();

        expect(financialAssistanceStore.setItemItem).toHaveBeenCalledTimes(1);
        expect(financialAssistanceStore.cancelOperation).toHaveBeenCalledTimes(1);
        expect(financialAssistanceStore.resetNewItem).toHaveBeenCalledTimes(1);
      });
    });

    describe('onCancel', () => {
      it('mutates storage', async () => {
        wrapper.vm.onCancel();

        expect(financialAssistanceStore.cancelOperation).toHaveBeenCalledTimes(1);
        expect(financialAssistanceStore.resetNewItem).toHaveBeenCalledTimes(1);
      });
    });
  });
});
