/**
 * @group ui/components/financial-assistance
 */

import { createLocalVue, mount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import { mockItems, mockSubItems } from '@/entities/financial-assistance';
import Component from '../Templates/SubItemButtons.vue';

const localVue = createLocalVue();
const storage = mockStorage();

const item = mockItems()[0];

const subItem = mockSubItems()[0];
storage.financialAssistance.getters.newSubItem = jest.fn(() => subItem);

describe('AddSubItemSubItem.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = mount(Component, {
      localVue,
      propsData: {
        item: item.subItems[0],
        index: 0,
        parent: item,
        parentIndex: 0,
        isEdit: false,
        isTableMode: true,
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Computed', () => {
    describe('items', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.items).toEqual(wrapper.vm.$storage.financialAssistance.getters.items());
      });
    });

    describe('addingItem', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.addingItem).toEqual(wrapper.vm.$storage.financialAssistance.getters.addingItem());
      });
    });

    describe('isOperating', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.addingItem).toEqual(wrapper.vm.$storage.financialAssistance.getters.isOperating());
      });
    });

    describe('loading', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.loading).toEqual(wrapper.vm.$storage.financialAssistance.getters.loading());
      });

      it('sets the right value', async () => {
        jest.clearAllMocks();

        wrapper.vm.loading = false;

        expect(storage.financialAssistance.mutations.setLoading).toHaveBeenCalledTimes(1);
        expect(storage.financialAssistance.mutations.setLoading).toHaveBeenCalledWith(false);
      });
    });

    describe('canDelete', () => {
      it('returns true if is create', async () => {
        await wrapper.setProps({
          isEdit: false,
        });

        expect(wrapper.vm.canDelete).toEqual(true);
      });

      it('returns true if have more than 1 valid item', async () => {
        const sub = mockSubItems()[0];
        const item1 = { subItems: [sub] };
        const item2 = { subItems: [sub] };
        const items = [item1, item2];

        wrapper = mount(Component, {
          localVue,
          propsData: {
            item: sub,
            index: 0,
            parent: item1,
            parentIndex: 0,
            isEdit: true,
            isTableMode: true,
          },
          computed: {
            items() {
              return items;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.canDelete).toEqual(true);
      });

      it('returns false if only 1 valid item', async () => {
        const sub = mockSubItems()[0];
        const item1 = { subItems: [sub] };
        const items = [item1];

        wrapper = mount(Component, {
          localVue,
          propsData: {
            item: sub,
            index: 0,
            parent: item1,
            parentIndex: 0,
            isEdit: true,
            isTableMode: true,
          },
          computed: {
            items() {
              return items;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.canDelete).toEqual(false);
      });

      it('returns true if multiple sub items', async () => {
        const sub1 = mockSubItems()[0];
        const sub2 = mockSubItems()[0];
        const item1 = { subItems: [sub1, sub2] };
        const items = [item1];

        wrapper = mount(Component, {
          localVue,
          propsData: {
            item: sub1,
            index: 0,
            parent: item1,
            parentIndex: 0,
            isEdit: true,
            isTableMode: true,
          },
          computed: {
            items() {
              return items;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.canDelete).toEqual(true);
      });
    });
  });

  describe('Methods', () => {
    describe('onEditSubItem', () => {
      it('mutates properly', async () => {
        wrapper.vm.onEditSubItem();

        expect(storage.financialAssistance.mutations.setNewSubItemSubItem).toHaveBeenCalledTimes(1);
        expect(storage.financialAssistance.mutations.setNewSubItemMaximum).toHaveBeenCalledTimes(1);
        expect(storage.financialAssistance.mutations.setNewSubItemAmountType).toHaveBeenCalledTimes(1);
        expect(storage.financialAssistance.mutations.setNewSubItemDocumentationRequired).toHaveBeenCalledTimes(1);
        expect(storage.financialAssistance.mutations.setNewSubItemFrequency).toHaveBeenCalledTimes(1);

        expect(storage.financialAssistance.mutations.setEditedItem).toHaveBeenCalledTimes(1);
        expect(storage.financialAssistance.mutations.setEditedItemIndex).toHaveBeenCalledTimes(1);
        expect(storage.financialAssistance.mutations.setEditedSubItemIndex).toHaveBeenCalledTimes(1);
      });
    });

    describe('onDeleteSubItem', () => {
      it('toast error message if can not delete', async () => {
        wrapper = mount(Component, {
          localVue,
          propsData: {
            item: item.subItems[0],
            index: 0,
            parent: item,
            parentIndex: 0,
            isEdit: false,
            isTableMode: true,
          },
          computed: {
            canDelete() {
              return false;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        jest.spyOn(wrapper.vm.$toasted.global, 'error').mockImplementation(() => {});

        wrapper.vm.onDeleteSubItem();

        expect(wrapper.vm.$toasted.global.error).toHaveBeenCalledWith('financialAssistance.errors.needItemSubItem');
      });

      it('mutates properly', async () => {
        wrapper.vm.onDeleteSubItem();

        expect(wrapper.vm.itemBeingDeletedName).toBe('Children\'s Supplies');
        expect(wrapper.vm.itemBeingDeletedIndex).toBe(0);
        expect(wrapper.vm.subItemBeingDeletedIndex).toBe(0);
        expect(wrapper.vm.showDeleteSubItemDialog).toBe(true);
      });
    });

    describe('onConfirmDeleteSubItem', () => {
      it('mutates properly', async () => {
        wrapper.vm.onConfirmDeleteSubItem();

        expect(wrapper.vm.itemBeingDeletedName).toBe('');
        expect(wrapper.vm.itemBeingDeletedIndex).toBe(-1);
        expect(wrapper.vm.subItemBeingDeletedIndex).toBe(-1);
        expect(wrapper.vm.showDeleteSubItemDialog).toBe(false);
      });

      it('calls deleteRemotely if it is edit', async () => {
        await wrapper.setProps({
          isEdit: true,
        });
        wrapper.vm.deleteRemotely = jest.fn();

        await wrapper.vm.onConfirmDeleteSubItem();

        expect(wrapper.vm.deleteRemotely).toHaveBeenCalledTimes(1);
      });

      it('calls deleteLocally if it is not edit', async () => {
        wrapper.vm.deleteLocally = jest.fn();

        await wrapper.vm.onConfirmDeleteSubItem();

        expect(wrapper.vm.deleteLocally).toHaveBeenCalledTimes(1);
      });
    });

    describe('deleteRemotely', () => {
      it('calls proper action', async () => {
        await wrapper.vm.deleteRemotely();

        expect(wrapper.vm.$storage.financialAssistance.actions.deleteSubItem).toHaveBeenCalledTimes(1);
      });

      it('reload items and toast success message', async () => {
        jest.spyOn(wrapper.vm.$toasted.global, 'success').mockImplementation(() => {});

        await wrapper.vm.deleteRemotely();

        expect(wrapper.vm.$storage.financialAssistance.actions.reloadItems).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('financialAssistance.toast.table.editTable');
      });
    });

    describe('deleteLocally', () => {
      it('delete subItem', async () => {
        wrapper.vm.deleteLocally();

        expect(wrapper.vm.$storage.financialAssistance.mutations.deleteSubItem).toHaveBeenCalledTimes(1);
      });

      it('delete item', async () => {
        wrapper.vm.parent.subItems.pop();

        wrapper.vm.deleteLocally();

        expect(wrapper.vm.$storage.financialAssistance.mutations.deleteItem).toHaveBeenCalledTimes(1);
      });
    });
  });
});
