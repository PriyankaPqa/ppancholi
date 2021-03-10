import { Store } from 'vuex';
import _sortBy from 'lodash/sortBy';
import { mockStore, IRootState } from '@/store';
import { mockOptionItemData, EOptionListItemStatus, EOptionLists } from '@/entities/optionItem';

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
      test('the addOrUpdateEvent mutation adds a new event to the state', () => {
        const item = mockOptionItemData()[0];

        expect(store.state.optionList.items).toEqual([]);

        store.commit('optionList/addOrUpdateItem', item);

        expect(store.state.optionList.items).toEqual([item]);
      });

      test('the addOrUpdateEvent mutation updates an existing event', () => {
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

    describe('updateName', () => {
      it('throws an error if list is not set in the store', async () => {
        await expect(store.dispatch('optionList/updateName')).rejects.toThrow();
      });

      it('calls the updateOptionItemName endpoint with the proper list', async () => {
        store.commit('optionList/setList', list);

        await store.dispatch('optionList/updateName', {
          id: 'ID',
          name: { translation: { en: 'EN NAME', fr: 'FR NAME' } },
        });

        expect(store.$services.optionItems.updateOptionItemName).toHaveBeenCalledWith(
          list,
          'ID',
          { translation: { en: 'EN NAME', fr: 'FR NAME' } },
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
          status: EOptionListItemStatus.Inactive,
        });

        expect(store.$services.optionItems.updateOptionItemStatus).toHaveBeenCalledWith(
          list,
          'ID',
          EOptionListItemStatus.Inactive,
        );
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
