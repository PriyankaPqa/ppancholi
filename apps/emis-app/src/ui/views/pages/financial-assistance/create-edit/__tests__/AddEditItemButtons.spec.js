import { createLocalVue, mount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import { mockItems } from '@libs/entities-lib/financial-assistance';
import Component from '../Templates/AddEditItemButtons.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('AddEditItemButtons.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = mount(Component, {
      localVue,
      propsData: {
        mode: 'add',
        failed: false,
      },
      mocks: {
        $storage: storage,
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

        await wrapper.vm.onAddItem();

        expect(wrapper.vm.$storage.financialAssistance.mutations.addItem).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$storage.financialAssistance.mutations.setAddingItem).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$storage.financialAssistance.mutations.resetNewItem).toHaveBeenCalledTimes(1);
      });
    });

    describe('onSaveEditItem', () => {
      it('mutates storage', async () => {
        wrapper.vm.$storage.financialAssistance.getters.newItem = jest.fn(() => mockItems()[0]);

        wrapper.vm.onSaveEditItem();

        expect(wrapper.vm.$storage.financialAssistance.mutations.setItemItem).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$storage.financialAssistance.mutations.cancelOperation).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$storage.financialAssistance.mutations.resetNewItem).toHaveBeenCalledTimes(1);
      });
    });

    describe('onCancel', () => {
      it('mutates storage', async () => {
        wrapper.vm.onCancel();

        expect(wrapper.vm.$storage.financialAssistance.mutations.cancelOperation).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$storage.financialAssistance.mutations.resetNewItem).toHaveBeenCalledTimes(1);
      });
    });
  });
});
