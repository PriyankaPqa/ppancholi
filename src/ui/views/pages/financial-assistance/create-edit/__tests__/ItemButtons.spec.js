import { createLocalVue, mount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import { mockItems } from '@/entities/financial-assistance';
import Component from '../Templates/ItemButtons.vue';

const localVue = createLocalVue();
const storage = mockStorage();

storage.financialAssistance.getters.items = jest.fn(() => mockItems());

const item = mockItems()[0];

describe('ItemButtons.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = mount(Component, {
      localVue,
      propsData: {
        item,
        index: 1,
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
        expect(wrapper.vm.items).toEqual(storage.financialAssistance.getters.items());
      });
    });

    describe('addingItem', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.addingItem).toEqual(storage.financialAssistance.getters.addingItem());
      });
    });

    describe('isOperating', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.isOperating).toEqual(storage.financialAssistance.getters.isOperating());
      });
    });

    describe('loading', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.loading).toEqual(storage.financialAssistance.getters.loading());
      });
    });
  });

  describe('Methods', () => {
    describe('onEditItem', () => {
      it('calls mutations', async () => {
        wrapper.vm.onEditItem();

        expect(storage.financialAssistance.mutations.setNewItemItem).toHaveBeenCalledTimes(1);
        expect(storage.financialAssistance.mutations.setEditedItem).toHaveBeenCalledTimes(1);
        expect(storage.financialAssistance.mutations.setEditedItemIndex).toHaveBeenCalledTimes(1);
      });
    });

    describe('onDeleteItem', () => {
      it('assign right value', async () => {
        wrapper.vm.onDeleteItem();

        expect(wrapper.vm.itemBeingDeletedName).toEqual(item.mainCategory.name.translation.en);
        expect(wrapper.vm.itemBeingDeletedIndex).toEqual(1);
        expect(wrapper.vm.showDeleteItemDialog).toEqual(true);
      });
    });

    describe('onConfirmDeleteItem', () => {
      it('calls mutation', async () => {
        await wrapper.setData({ itemBeingDeletedIndex: 0 });

        wrapper.vm.onConfirmDeleteItem();

        expect(storage.financialAssistance.mutations.deleteItem).toHaveBeenCalledTimes(1);

        expect(wrapper.vm.itemBeingDeletedName).toBe('');
        expect(wrapper.vm.itemBeingDeletedIndex).toBe(-1);
        expect(wrapper.vm.showDeleteItemDialog).toBe(false);
      });
    });
  });
});
