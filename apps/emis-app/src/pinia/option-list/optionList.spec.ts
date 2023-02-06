import {
  mockOptionItemData, mockSubItem, EOptionLists,
} from '@libs/entities-lib/optionItem';

import { Status } from '@libs/entities-lib/base';
import { mockCreateOptionPayload } from '@/pinia/option-list/optionList.mock';
import { createTestingPinia } from '@pinia/testing';
import { defineStore, setActivePinia } from 'pinia';
import Vue from 'vue';
import { mockOptionItemsServiceService } from '@libs/services-lib/optionItems';
import { getExtensionComponents } from '@/pinia/option-list/optionListExtension';

const entityService = mockOptionItemsServiceService();

const getPinia = () => {
  const pinia = createTestingPinia({
    initialState: {
      'test-option-list': {
        items: [],
        list: null,
      },
    },
    stubActions: false,
  });
  setActivePinia(pinia);
  return pinia;
};

const useOptionListTestStore = () => {
  const extensionComponents = getExtensionComponents(entityService);

  const useOptionListStore = defineStore('test-option-list', () => ({
    ...extensionComponents,
  }));
  return useOptionListStore();
};

const createTestStore = () => {
  getPinia();
  return useOptionListTestStore();
};

describe('>>> Option List Store', () => {
  Vue.prototype.$reportToasted = jest.fn();

  const list = EOptionLists.EventTypes;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('>> Getters', () => {
    describe('getItems', () => {
      it('returns the items in order of orderRank', () => {
        const store = createTestStore();
        const items = mockOptionItemData();

        store.items = [
          items[2],
          items[0],
          items[1],
        ];

        const expectResult = [
          items[0],
          items[1],
          items[2],
        ];

        expect(store.getItems()).toEqual(expectResult);
      });
    });
  });

  describe('addOrUpdateItem', () => {
    test('the addOrUpdateItem mutation adds a new option item to the state', () => {
      const store = createTestStore();
      const item = mockOptionItemData()[0];
      store.items = [];
      expect(store.items).toEqual([]);

      store.addOrUpdateItem(item);

      expect(store.items).toEqual([item]);
    });

    test('the addOrUpdateItem mutation updates an existing option item', () => {
      const store = createTestStore();
      const items = mockOptionItemData();
      store.items = items;
      expect(store.items).toEqual(items);

      const updatedItem = mockOptionItemData()[0];

      updatedItem.name = {
        translation: {
          en: 'UPDATED EN',
          fr: 'UPDATED FR',
        },
      };

      store.addOrUpdateItem(updatedItem);

      expect(store.items).toEqual([
        {
          ...items[0],
          name: {
            translation: {
              en: 'UPDATED EN',
              fr: 'UPDATED FR',
            },
          },
        },
        ...items.slice(1),
      ]);
    });
  });

  describe('resetState', () => {
    it('resets the state to default', () => {
      const store = createTestStore();
      store.list = list;
      store.items = mockOptionItemData();
      store.resetState();

      expect(store.list).toBe(null);
      expect(store.items).toEqual([]);
    });
  });

  describe('>> Actions', () => {
    describe('fetchItems', () => {
      it('throws an error if list is not set in the store', async () => {
        const store = createTestStore();
        await expect(store.fetchItems).rejects.toThrow();
      });

      it('calls the getOptionList endpoint with the proper list', async () => {
        const store = createTestStore();
        store.list = list;
        await store.fetchItems();
        expect(entityService.getOptionList).toHaveBeenCalledWith(list);
      });
    });

    describe('createOption', () => {
      it('throws an error if list is not set in the store', async () => {
        const store = createTestStore();
        await expect(store.fetchItems).rejects.toThrow();
      });

      it('calls the createOptionItem endpoint with the proper list', async () => {
        const store = createTestStore();
        store.list = list;
        await store.createOption(mockCreateOptionPayload);
        expect(entityService.createOptionItem).toHaveBeenCalledWith(list, mockCreateOptionPayload);
      });
    });

    describe('addSubItem', () => {
      it('throws an error if list is not set in the store', async () => {
        const store = createTestStore();
        await expect(store.addSubItem).rejects.toThrow();
      });

      it('calls the addSubItem endpoint with the proper list', async () => {
        const store = createTestStore();

        store.list = list;

        const itemId = 'item id';
        const subItem = mockSubItem();
        await store.addSubItem(itemId, subItem);
        // await store.dispatch('optionList/addSubItem', { itemId, subItem });

        expect(entityService.addSubItem).toHaveBeenCalledWith(list, itemId, subItem);
      });
    });

    describe('updateItem', () => {
      it('throws an error if list is not set in the store', async () => {
        const store = createTestStore();

        await expect(store.updateItem).rejects.toThrow();
      });

      it('calls the updateOptionItemName endpoint with the proper list', async () => {
        const store = createTestStore();

        store.list = list;

        await store.updateItem({
          id: 'ID',
          name: { translation: { en: 'EN NAME', fr: 'FR NAME' } },
          description: { translation: { en: 'EN DESC', fr: 'FR DESC' } },
        });

        expect(entityService.updateOptionItem).toHaveBeenCalledWith(
          list,
          'ID',
          { translation: { en: 'EN NAME', fr: 'FR NAME' } },
          { translation: { en: 'EN DESC', fr: 'FR DESC' } },
        );
      });
    });

    describe('updateSubItem', () => {
      it('throws an error if list is not set in the store', async () => {
        const store = createTestStore();

        await expect(store.updateSubItem).rejects.toThrow();
      });

      it('calls the updateOptionSubItem endpoint with the proper list', async () => {
        const store = createTestStore();

        const itemId = 'item id';
        const subItemId = 'subItem id';
        const name = { translation: { en: 'name EN', fr: 'name FR' } };
        const description = { translation: { en: 'description EN', fr: 'description FR' } };

        store.list = list;
        await store.updateSubItem({
          itemId,
          subItemId,
          name,
          description,
        });

        expect(entityService.updateOptionSubItem).toHaveBeenCalledWith(
          list,
          itemId,
          subItemId,
          name,
          description,
        );
      });
    });

    describe('updateStatus', () => {
      it('throws an error if list is not set in the store', async () => {
        const store = createTestStore();

        await expect(store.updateStatus).rejects.toThrow();
      });

      it('calls the updateEventTypeStatus endpoint with the proper list', async () => {
        const store = createTestStore();

        store.list = list;

        await store.updateStatus({
          id: 'ID',
          status: Status.Inactive,
        });

        expect(entityService.updateOptionItemStatus).toHaveBeenCalledWith(
          list,
          'ID',
          Status.Inactive,
        );
      });
    });

    describe('updateSubItemStatus', () => {
      it('throws an error if list is not set in the store', async () => {
        const store = createTestStore();

        await expect(store.updateSubItemStatus).rejects.toThrow();
      });

      it('calls the updateOptionItemStatus endpoint with the proper list', async () => {
        const store = createTestStore();

        store.list = list;

        const itemId = 'itemId';
        const subItemId = 'subItemId';
        const status = Status.Inactive;

        await store.updateSubItemStatus({ itemId, subItemId, status });

        expect(entityService.updateOptionSubItemStatus).toHaveBeenCalledWith(list, itemId, subItemId, status);
      });
    });

    describe('updateOrderRanks', () => {
      it('throws an error if list is not set in the store', async () => {
        const store = createTestStore();

        await expect(store.updateOrderRanks).rejects.toThrow();
      });

      it('calls the updateOptionItemOrderRanks endpoint if the list is Event Types', async () => {
        const store = createTestStore();
        const items = mockOptionItemData();

        store.list = list;
        store.items = items;

        await store.updateOrderRanks([
          items[2], // Earthquake orderRank: 4
          items[0], // Flood orderRank: 2
          items[1], // Wildfire orderRank: 3
        ]);

        expect(entityService.updateOptionItemOrderRanks).toHaveBeenCalledWith(list, {
          [items[2].id]: 2,
          [items[0].id]: 3,
          [items[1].id]: 4,
        });
      });
    });

    describe('updateSubItemOrderRanks', () => {
      it('throws an error if list is not set in the store', async () => {
        const store = createTestStore();

        await expect(store.updateSubItemOrderRanks).rejects.toThrow();
      });

      it('calls the updateSubItemOrderRanks endpoint if the list is Event Types', async () => {
        const store = createTestStore();
        const item = mockOptionItemData()[0];

        item.subitems[0].orderRank = 2;
        item.subitems[1].orderRank = 1;

        store.list = list;
        store.addOrUpdateItem(item);

        await store.updateSubItemOrderRanks(item);

        expect(entityService.updateOptionSubItemOrderRanks).toHaveBeenCalledWith(list, item.id, {
          [item.subitems[0].id]: 1,
          [item.subitems[1].id]: 2,
        });
      });
    });

    describe('setIsOther', () => {
      it('throws an error if list is not set in the store', async () => {
        const store = createTestStore();
        await expect(store.setIsOther).rejects.toThrow();
      });

      it('calls the setOptionItemIsOther endpoint if the list is Event Types', async () => {
        const store = createTestStore();
        store.list = list;
        await store.setIsOther({
          id: 'ID',
          isOther: true,
        });

        expect(entityService.setOptionItemIsOther).toHaveBeenCalledWith(
          list,
          'ID',
          true,
        );
      });
    });

    describe('setIsDefault', () => {
      it('throws an error if list is not set in the store', async () => {
        const store = createTestStore();
        await expect(store.setIsDefault).rejects.toThrow();
      });

      it('calls the setOptionItemIsDefault endpoint if the list is Event Types', async () => {
        const store = createTestStore();
        store.list = list;
        await store.setIsDefault({
          id: 'ID',
          isDefault: true,
        });

        expect(entityService.setOptionItemIsDefault).toHaveBeenCalledWith(
          list,
          'ID',
          true,
        );
      });
    });
  });
});
