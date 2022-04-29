import { Store } from 'vuex';
import _sortBy from 'lodash/sortBy';
import { mockStore, IRootState } from '@/store';
import {
  mockOptionItemData, mockSubItem, EOptionLists,
} from '@/entities/optionItem';

import { Status } from '@libs/core-lib/entities/base';

describe('>>> Option List Module', () => {
  let store: Store<IRootState>;

  const list = EOptionLists.EventTypes;

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore();
  });

  describe('>> Getters', () => {
    describe('items', () => {
      it('returns the items in order of orderRank', () => {
        const items = mockOptionItemData();

        store.commit('optionList/setItems', [
          items[2],
          items[0],
          items[1],
        ]);

        expect(store.getters['optionList/items']).toEqual(_sortBy(mockOptionItemData(), 'orderRank'));
      });
    });
  });

  describe('>> Mutations', () => {
    describe('setItems', () => {
      it('sets the items in the store', () => {
        const items = mockOptionItemData();

        expect(store.state.optionList.items).toEqual([]);

        store.commit('optionList/setItems', [
          items[2],
          items[1],
        ]);

        expect(store.state.optionList.items).toEqual([
          items[2],
          items[1],
        ]);
      });
    });

    describe('setList', () => {
      it('sets the list value in the state', () => {
        expect(store.state.optionList.list).toBe(null);

        store.commit('optionList/setList', list);

        expect(store.state.optionList.list).toBe(list);
      });
    });

    describe('addOrUpdateItem', () => {
      test('the addOrUpdateItem mutation adds a new option item to the state', () => {
        const item = mockOptionItemData()[0];

        expect(store.state.optionList.items).toEqual([]);

        store.commit('optionList/addOrUpdateItem', item);

        expect(store.state.optionList.items).toEqual([item]);
      });

      test('the addOrUpdateItem mutation updates an existing option item', () => {
        const items = mockOptionItemData();

        store.commit('optionList/setItems', items);

        expect(store.state.optionList.items).toEqual(items);

        const updatedItem = mockOptionItemData()[0];

        updatedItem.name = {
          translation: {
            en: 'UPDATED EN',
            fr: 'UPDATED FR',
          },
        };

        store.commit('optionList/addOrUpdateItem', updatedItem);

        expect(store.state.optionList.items).toEqual([
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
        store.commit('optionList/setList', list);
        store.commit('optionList/setItems', mockOptionItemData());
        store.commit('optionList/resetState');

        expect(store.state.optionList.list).toBe(null);
        expect(store.state.optionList.items).toEqual([]);
      });
    });
  });

  describe('>> Actions', () => {
    describe('fetchItems', () => {
      it('throws an error if list is not set in the store', async () => {
        await expect(store.dispatch('optionList/fetchItems')).rejects.toThrow();
      });

      it('calls the getOptionList endpoint with the proper list', async () => {
        store.commit('optionList/setList', list);

        await store.dispatch('optionList/fetchItems');

        expect(store.$services.optionItems.getOptionList).toHaveBeenCalledWith(list);
      });
    });

    describe('createOption', () => {
      it('throws an error if list is not set in the store', async () => {
        await expect(store.dispatch('optionList/createOption')).rejects.toThrow();
      });

      it('calls the createOptionItem endpoint with the proper list', async () => {
        store.commit('optionList/setList', list);

        await store.dispatch('optionList/createOption');
        expect(store.$services.optionItems.createOptionItem).toHaveBeenCalledWith(list, undefined);
      });
    });

    describe('addSubItem', () => {
      it('throws an error if list is not set in the store', async () => {
        await expect(store.dispatch('optionList/addSubItem')).rejects.toThrow();
      });

      it('calls the addSubItem endpoint with the proper list', async () => {
        store.commit('optionList/setList', list);

        const itemId = 'item id';
        const subItem = mockSubItem();

        await store.dispatch('optionList/addSubItem', { itemId, subItem });

        expect(store.$services.optionItems.addSubItem).toHaveBeenCalledWith(list, itemId, subItem);
      });
    });

    describe('updateItem', () => {
      it('throws an error if list is not set in the store', async () => {
        await expect(store.dispatch('optionList/updateItem')).rejects.toThrow();
      });

      it('calls the updateOptionItemName endpoint with the proper list', async () => {
        store.commit('optionList/setList', list);

        await store.dispatch('optionList/updateItem', {
          id: 'ID',
          name: { translation: { en: 'EN NAME', fr: 'FR NAME' } },
          description: { translation: { en: 'EN DESC', fr: 'FR DESC' } },
        });

        expect(store.$services.optionItems.updateOptionItem).toHaveBeenCalledWith(
          list,
          'ID',
          { translation: { en: 'EN NAME', fr: 'FR NAME' } },
          { translation: { en: 'EN DESC', fr: 'FR DESC' } },
        );
      });
    });

    describe('updateSubItem', () => {
      it('throws an error if list is not set in the store', async () => {
        await expect(store.dispatch('optionList/updateSubItem')).rejects.toThrow();
      });

      it('calls the updateOptionSubItem endpoint with the proper list', async () => {
        const itemId = 'item id';
        const subItemId = 'subItem id';
        const name = { translation: { en: 'name EN', fr: 'name FR' } };
        const description = { translation: { en: 'description EN', fr: 'description FR' } };

        store.commit('optionList/setList', list);

        await store.dispatch('optionList/updateSubItem', {
          itemId,
          subItemId,
          name,
          description,
        });

        expect(store.$services.optionItems.updateOptionSubItem).toHaveBeenCalledWith(
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
        await expect(store.dispatch('optionList/updateStatus')).rejects.toThrow();
      });

      it('calls the updateEventTypeStatus endpoint with the proper list', async () => {
        store.commit('optionList/setList', list);

        await store.dispatch('optionList/updateStatus', {
          list,
          id: 'ID',
          status: Status.Inactive,
        });

        expect(store.$services.optionItems.updateOptionItemStatus).toHaveBeenCalledWith(
          list,
          'ID',
          Status.Inactive,
        );
      });
    });

    describe('updateSubItemStatus', () => {
      it('throws an error if list is not set in the store', async () => {
        await expect(store.dispatch('optionList/updateSubItemStatus')).rejects.toThrow();
      });

      it('calls the updateOptionItemStatus endpoint with the proper list', async () => {
        store.commit('optionList/setList', list);

        const itemId = 'itemId';
        const subItemId = 'subItemId';
        const status = Status.Inactive;

        await store.dispatch('optionList/updateSubItemStatus', { itemId, subItemId, status });

        expect(store.$services.optionItems.updateOptionSubItemStatus).toHaveBeenCalledWith(list, itemId, subItemId, status);
      });
    });

    describe('updateOrderRanks', () => {
      it('throws an error if list is not set in the store', async () => {
        await expect(store.dispatch('optionList/updateOrderRanks')).rejects.toThrow();
      });

      it('calls the updateOptionItemOrderRanks endpoint if the list is Event Types', async () => {
        const items = mockOptionItemData();

        store.commit('optionList/setList', list);
        store.commit('optionList/setItems', items);

        await store.dispatch('optionList/updateOrderRanks', [
          items[2], // Earthquake orderRank: 4
          items[0], // Flood orderRank: 2
          items[1], // Wildfire orderRank: 3
        ]);

        expect(store.$services.optionItems.updateOptionItemOrderRanks).toHaveBeenCalledWith(list, {
          [items[2].id]: 2,
          [items[0].id]: 3,
          [items[1].id]: 4,
        });
      });
    });

    describe('updateSubItemOrderRanks', () => {
      it('throws an error if list is not set in the store', async () => {
        await expect(store.dispatch('optionList/updateSubItemOrderRanks')).rejects.toThrow();
      });

      it('calls the updateSubItemOrderRanks endpoint if the list is Event Types', async () => {
        const item = mockOptionItemData()[0];

        item.subitems[0].orderRank = 2;
        item.subitems[1].orderRank = 1;

        store.commit('optionList/setList', list);
        store.commit('optionList/addOrUpdateItem', item);

        await store.dispatch('optionList/updateSubItemOrderRanks', item);

        expect(store.$services.optionItems.updateOptionSubItemOrderRanks).toHaveBeenCalledWith(list, item.id, {
          [item.subitems[0].id]: 1,
          [item.subitems[1].id]: 2,
        });
      });
    });

    describe('setIsOther', () => {
      it('throws an error if list is not set in the store', async () => {
        await expect(store.dispatch('optionList/setIsOther')).rejects.toThrow();
      });

      it('calls the setOptionItemIsOther endpoint if the list is Event Types', async () => {
        store.commit('optionList/setList', list);

        await store.dispatch('optionList/setIsOther', {
          id: 'ID',
          isOther: true,
        });

        expect(store.$services.optionItems.setOptionItemIsOther).toHaveBeenCalledWith(
          list,
          'ID',
          true,
        );
      });
    });

    describe('setIsDefault', () => {
      it('throws an error if list is not set in the store', async () => {
        await expect(store.dispatch('optionList/setIsDefault')).rejects.toThrow();
      });

      it('calls the setOptionItemIsDefault endpoint if the list is Event Types', async () => {
        store.commit('optionList/setList', list);

        await store.dispatch('optionList/setIsDefault', {
          id: 'ID',
          isDefault: true,
        });

        expect(store.$services.optionItems.setOptionItemIsDefault).toHaveBeenCalledWith(
          list,
          'ID',
          true,
        );
      });
    });
  });
});
