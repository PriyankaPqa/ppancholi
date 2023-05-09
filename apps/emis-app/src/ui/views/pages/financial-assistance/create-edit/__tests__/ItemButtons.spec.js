import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockItems, mockSubItems } from '@libs/entities-lib/financial-assistance';
import { useMockFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance.mock';
import Component from '../Templates/ItemButtons.vue';

const localVue = createLocalVue();

const { financialAssistanceStore, pinia } = useMockFinancialAssistanceStore();
financialAssistanceStore.mainItems = mockItems();
financialAssistanceStore.$patch = jest.fn();

const item = mockItems()[0];

describe('ItemButtons.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      propsData: {
        item,
        index: 1,
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
    });

    describe('canDelete', () => {
      it('returns true if is create', async () => {
        await wrapper.setProps({
          isEdit: false,
        });

        expect(wrapper.vm.canDelete).toEqual(true);
      });

      it('returns true if have more than 1 valid item', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            item,
            index: 1,
            isEdit: true,
            isTableMode: true,
          },
          computed: {
            items() {
              return [
                {
                  subItems: mockSubItems(),
                },
                {
                  subItems: mockSubItems(),
                },
              ];
            },
          },
        });

        expect(wrapper.vm.canDelete).toEqual(true);
      });

      it('returns false if only 1 valid item', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            item,
            index: 1,
            isEdit: true,
            isTableMode: true,
          },
          computed: {
            items() {
              return [
                {
                  subItems: mockSubItems(),
                },
              ];
            },
          },
        });

        expect(wrapper.vm.canDelete).toEqual(false);
      });
    });
  });

  describe('Methods', () => {
    describe('onEditItem', () => {
      it('calls store methods', async () => {
        await wrapper.vm.onEditItem();
        expect(financialAssistanceStore.$patch).toHaveBeenCalledTimes(1);
      });
    });

    describe('onDeleteItem', () => {
      it('toast error message if can not delete', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            item,
            index: 1,
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

        wrapper.vm.onDeleteItem();

        expect(wrapper.vm.$toasted.global.error).toHaveBeenCalledWith('financialAssistance.errors.needItemSubItem');
      });

      it('assign right value', async () => {
        wrapper.vm.onDeleteItem();

        expect(wrapper.vm.itemBeingDeletedName).toEqual(item.mainCategory.name.translation.en);
        expect(wrapper.vm.itemBeingDeletedIndex).toEqual(1);
        expect(wrapper.vm.showDeleteItemDialog).toEqual(true);
      });
    });

    describe('onConfirmDeleteItem', () => {
      it('calls deleteLocally if it is not edit', async () => {
        await wrapper.setData({ itemBeingDeletedIndex: 0 });

        wrapper.vm.deleteLocally = jest.fn();

        await wrapper.vm.onConfirmDeleteItem();

        expect(wrapper.vm.deleteLocally).toHaveBeenCalledTimes(1);

        expect(wrapper.vm.itemBeingDeletedName).toBe('');
        expect(wrapper.vm.itemBeingDeletedIndex).toBe(-1);
        expect(wrapper.vm.showDeleteItemDialog).toBe(false);
      });

      it('calls deleteRemotely if it is not edit', async () => {
        await wrapper.setProps({
          isEdit: true,
        });

        await wrapper.setData({ itemBeingDeletedIndex: 0 });

        wrapper.vm.deleteRemotely = jest.fn();

        await wrapper.vm.onConfirmDeleteItem();

        expect(wrapper.vm.deleteRemotely).toHaveBeenCalledTimes(1);

        expect(wrapper.vm.itemBeingDeletedName).toBe('');
        expect(wrapper.vm.itemBeingDeletedIndex).toBe(-1);
        expect(wrapper.vm.showDeleteItemDialog).toBe(false);
      });
    });

    describe('deleteRemotely', () => {
      it('delete remotely', async () => {
        await wrapper.vm.deleteRemotely();

        expect(financialAssistanceStore.deleteItem).toHaveBeenCalledTimes(1);
      });

      it('reload items and toast success message', async () => {
        jest.spyOn(wrapper.vm.$toasted.global, 'success').mockImplementation(() => {});

        await wrapper.vm.deleteRemotely();

        expect(financialAssistanceStore.reloadItems).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('financialAssistance.toast.table.editTable');
      });
    });

    describe('deleteLocally', () => {
      it('delete locally', async () => {
        wrapper.vm.deleteLocally();

        expect(financialAssistanceStore.removeItem).toHaveBeenCalledTimes(1);
      });
    });
  });
});
