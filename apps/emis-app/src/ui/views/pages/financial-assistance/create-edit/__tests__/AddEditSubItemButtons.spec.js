/**
 * @group ui/components/financial-assistance
 */

import { createLocalVue, mount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import { mockItems } from '@/entities/financial-assistance';
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
        wrapper.vm.addSubItem = jest.fn();

        wrapper.vm.onClickSave();

        expect(wrapper.vm.addSubItem).toHaveBeenCalledTimes(1);
      });

      it('calls saveSubItem if is edit', async () => {
        await wrapper.setProps({ mode: 'edit' });
        wrapper.vm.saveSubItem = jest.fn();

        wrapper.vm.onClickSave();

        expect(wrapper.vm.saveSubItem).toHaveBeenCalledTimes(1);
      });
    });

    describe('addSubItem', () => {
      it('call addLocally if is not edit', async () => {
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
        wrapper.vm.addLocally = jest.fn();
        wrapper.vm.addRemotely = jest.fn();

        await wrapper.vm.addSubItem();

        expect(wrapper.vm.addLocally).toHaveBeenCalledTimes(1);
      });

      it('call addRemotely if is edit', async () => {
        wrapper = mount(Component, {
          localVue,
          propsData: {
            mode: 'add',
            isEdit: true,
            failed: false,
            isTableMode: true,
          },
          mocks: {
            $storage: storage,
          },
        });

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
        wrapper.vm.addRemotely = jest.fn();

        await wrapper.vm.addSubItem();

        expect(wrapper.vm.addRemotely).toHaveBeenCalledTimes(1);
      });
    });

    describe('saveSubItem', () => {
      it('call saveLocally if is not edit', async () => {
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

        wrapper.vm.saveLocally = jest.fn();

        await wrapper.vm.saveSubItem();

        expect(wrapper.vm.saveLocally).toHaveBeenCalledTimes(1);
      });

      it('call saveRemotely if is edit', async () => {
        wrapper = mount(Component, {
          localVue,
          propsData: {
            mode: 'add',
            isEdit: true,
            failed: false,
            isTableMode: true,
          },
          mocks: {
            $storage: storage,
          },
        });

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

        wrapper.vm.saveRemotely = jest.fn();

        await wrapper.vm.saveSubItem();

        expect(wrapper.vm.saveRemotely).toHaveBeenCalledTimes(1);
      });
    });

    describe('addRemotely', () => {
      it('add remotely', async () => {
        await wrapper.setProps({
          index: 0,
        });
        wrapper.vm.$storage.financialAssistance.getters.items = jest.fn(() => mockItems());

        await wrapper.vm.addRemotely();
        expect(wrapper.vm.$storage.financialAssistance.actions.createSubItem).toHaveBeenCalledTimes(1);

        wrapper.vm.$storage.financialAssistance.getters.items = jest.fn(() => [{
          subItems: [],
        }]);

        await wrapper.vm.addRemotely();
        expect(wrapper.vm.$storage.financialAssistance.actions.createItem).toHaveBeenCalledTimes(1);
      });

      it('reload items and toast success message', async () => {
        await wrapper.setProps({
          index: 0,
        });
        wrapper.vm.$storage.financialAssistance.getters.items = jest.fn(() => mockItems());
        jest.spyOn(wrapper.vm.$toasted.global, 'success').mockImplementation(() => {});

        await wrapper.vm.addRemotely();

        expect(wrapper.vm.$storage.financialAssistance.actions.reloadItems).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('financialAssistance.toast.table.editTable');
      });
    });

    describe('addLocally', () => {
      it('add locally', () => {
        wrapper.vm.addLocally();

        expect(wrapper.vm.$storage.financialAssistance.mutations.addSubItem).toHaveBeenCalledTimes(1);
      });
    });

    describe('saveRemotely', () => {
      it('save remotely', () => {
        wrapper.vm.saveRemotely();

        expect(wrapper.vm.$storage.financialAssistance.actions.editSubItem).toHaveBeenCalledTimes(1);
      });
    });

    describe('saveLocally', () => {
      it('save locally', () => {
        wrapper.vm.saveLocally();

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
