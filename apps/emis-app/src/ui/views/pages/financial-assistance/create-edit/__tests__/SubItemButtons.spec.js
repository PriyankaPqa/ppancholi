import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockItems, mockSubItems } from '@libs/entities-lib/financial-assistance';
import { useMockFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance.mock';
import Component from '../Templates/SubItemButtons.vue';

const localVue = createLocalVue();

const { pinia, financialAssistanceStore } = useMockFinancialAssistanceStore();

const item = mockItems()[0];
const subItem = mockSubItems()[0];
financialAssistanceStore.newSubItem = subItem;

describe('AddSubItemSubItem.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      propsData: {
        item: item.subItems[0],
        index: 0,
        parent: item,
        parentIndex: 0,
        isEdit: false,
        isTableMode: true,
      },
    });
    wrapper.vm.$t = jest.fn((text) => text);
  });

  describe('Computed', () => {
    describe('items', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.items).toEqual(financialAssistanceStore.mainItems);
      });
    });

    describe('addingItem', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.addingItem).toEqual(financialAssistanceStore.addingItem);
      });
    });

    describe('isOperating', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.isOperating).toEqual(financialAssistanceStore.isOperating());
      });
    });

    describe('loading', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.loading).toEqual(financialAssistanceStore.loading);
      });

      it('sets the right value', async () => {
        jest.clearAllMocks();
        wrapper.vm.loading = false;
        expect(financialAssistanceStore.loading).toEqual(false);
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

        wrapper = shallowMount(Component, {
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
        });

        expect(wrapper.vm.canDelete).toEqual(true);
      });

      it('returns false if only 1 valid item', async () => {
        const sub = mockSubItems()[0];
        const item1 = { subItems: [sub] };
        const items = [item1];

        wrapper = shallowMount(Component, {
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
        });

        expect(wrapper.vm.canDelete).toEqual(false);
      });

      it('returns true if multiple sub items', async () => {
        const sub1 = mockSubItems()[0];
        const sub2 = mockSubItems()[0];
        const item1 = { subItems: [sub1, sub2] };
        const items = [item1];

        wrapper = shallowMount(Component, {
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
        });

        expect(wrapper.vm.canDelete).toEqual(true);
      });
    });
  });

  describe('Methods', () => {
    describe('onEditSubItem', () => {
      it('mutates properly', async () => {
        await wrapper.vm.onEditSubItem();
        expect(financialAssistanceStore.$patch).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$pinia.state.value['financial-assistance-entities'].editedItemIndex).toEqual(0);
      });
    });

    describe('onDeleteSubItem', () => {
      it('toast error message if can not delete', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
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

        expect(financialAssistanceStore.deleteSubItem).toHaveBeenCalledTimes(1);
      });

      it('reload items and toast success message', async () => {
        jest.spyOn(wrapper.vm.$toasted.global, 'success').mockImplementation(() => {});

        await wrapper.vm.deleteRemotely();

        expect(financialAssistanceStore.reloadItems).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('financialAssistance.toast.table.editTable');
      });
    });

    describe('deleteLocally', () => {
      it('delete subItem', async () => {
        wrapper.vm.deleteLocally();

        expect(financialAssistanceStore.removeSubItem).toHaveBeenCalledTimes(1);
      });

      it('delete item', async () => {
        wrapper.vm.parent.subItems.pop();

        wrapper.vm.deleteLocally();

        expect(financialAssistanceStore.removeItem).toHaveBeenCalledTimes(1);
      });
    });
  });
});
