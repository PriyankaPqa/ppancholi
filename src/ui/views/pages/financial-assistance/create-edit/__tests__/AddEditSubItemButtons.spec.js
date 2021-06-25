import { createLocalVue, mount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import Component from '../Templates/AddEditSubItemButtons.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('AddEditSubItemButtons.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = mount(Component, {
      localVue,
      propsData: {
        mode: 'add',
        isEdit: false,
        failed: false,
        isTableMode: true,
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Computed', () => {
    describe('loading', () => {
      it('returns the right value', async () => {
        wrapper.vm.$storage.financialAssistance.getters.loading = jest.fn(() => true);

        expect(wrapper.vm.loading).toEqual(true);
      });
    });

    describe('saveButtonLabel', () => {
      it('returns the right value', async () => {
        await wrapper.setProps({ mode: 'edit' });

        expect(wrapper.vm.saveButtonLabel).toEqual('common.save');

        await wrapper.setProps({ mode: 'add' });

        expect(wrapper.vm.saveButtonLabel).toEqual('common.add');
      });
    });

    describe('saveButtonDataTest', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.saveButtonDataTest).toEqual('financialAssistanceItems__confirmAddSubItemBtn');

        await wrapper.setProps({ mode: 'edit' });

        expect(wrapper.vm.saveButtonDataTest).toEqual('financialAssistanceItems__confirmEditSubItemBtn');
      });
    });

    describe('cancelButtonDataTest', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.cancelButtonDataTest).toEqual('financialAssistanceItems__cancelAddSubItemBtn');

        await wrapper.setProps({ mode: 'edit' });

        expect(wrapper.vm.cancelButtonDataTest).toEqual('financialAssistanceItems__cancelEditSubItemBtn');
      });
    });
  });

  describe('Methods', () => {
    describe('onClickSave', () => {
      it('calls onAddItem if is add', async () => {
        wrapper.vm.onAddSubItem = jest.fn();

        wrapper.vm.onClickSave();

        expect(wrapper.vm.onAddSubItem).toHaveBeenCalledTimes(1);
      });

      it('calls onSaveEditSubItem if is edit', async () => {
        await wrapper.setProps({ mode: 'edit' });
        wrapper.vm.onSaveEditSubItem = jest.fn();

        wrapper.vm.onClickSave();

        expect(wrapper.vm.onSaveEditSubItem).toHaveBeenCalledTimes(1);
      });
    });

    describe('onAddSubItem', () => {
      it('mutates storage', async () => {
        wrapper.vm.$parent = {
          $parent: {
            $parent: {
              $parent: {
                $refs: {
                  form: {
                    validate: jest.fn(() => true),
                  },
                },
              },
            },
          },
        };

        await wrapper.vm.onAddSubItem();

        expect(wrapper.vm.$storage.financialAssistance.mutations.addSubItem).toHaveBeenCalledTimes(1);
      });
    });

    describe('onSaveEditItem', () => {
      it('mutates storage', async () => {
        wrapper.vm.$parent = {
          $parent: {
            $parent: {
              $parent: {
                $parent: {
                  $refs: {
                    form: {
                      validate: jest.fn(() => true),
                    },
                  },
                },
              },
            },
          },
        };

        await wrapper.vm.onSaveEditSubItem();

        expect(wrapper.vm.$storage.financialAssistance.mutations.setSubItem).toHaveBeenCalledTimes(1);
      });
    });

    describe('onCancel', () => {
      it('mutates storage', async () => {
        wrapper.vm.onCancel();

        expect(wrapper.vm.$storage.financialAssistance.mutations.cancelOperation).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$storage.financialAssistance.mutations.resetNewSubItem).toHaveBeenCalledTimes(1);
      });
    });
  });
});
