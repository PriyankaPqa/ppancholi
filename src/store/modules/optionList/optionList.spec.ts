import { Store } from 'vuex';
import _sortBy from 'lodash/sortBy';
import { mockStore, IRootState } from '@/store';
import { mockEventTypeData } from '@/entities/eventType';
import { EOptionListItemStatus, EOptionLists } from '@/types';

describe('>>> Option List Module', () => {
  let store: Store<IRootState>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore();
  });

  describe('>> Getters', () => {
    describe('items', () => {
      it('returns the items in order of orderRank', () => {
        const items = mockEventTypeData();

        store.commit('optionList/setItems', [
          items[2],
          items[0],
          items[1],
        ]);

        expect(store.getters['optionList/items']).toEqual(_sortBy(mockEventTypeData(), 'orderRank'));
      });
    });
  });

  describe('>> Mutations', () => {
    describe('setItems', () => {
      it('sets the items in the store', () => {
        const items = mockEventTypeData();

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

        store.commit('optionList/setList', EOptionLists.EventTypes);

        expect(store.state.optionList.list).toBe(EOptionLists.EventTypes);
      });
    });

    describe('addOrUpdateItem', () => {
      test('the addOrUpdateEvent mutation adds a new event to the state', () => {
        const item = mockEventTypeData()[0];

        expect(store.state.optionList.items).toEqual([]);

        store.commit('optionList/addOrUpdateItem', item);

        expect(store.state.optionList.items).toEqual([item]);
      });

      test('the addOrUpdateEvent mutation updates an existing event', () => {
        const items = mockEventTypeData();

        store.commit('optionList/setItems', items);

        expect(store.state.optionList.items).toEqual(items);

        const updatedItem = mockEventTypeData()[0];

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
        store.commit('optionList/setList', EOptionLists.EventTypes);
        store.commit('optionList/setItems', mockEventTypeData());
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

      it('calls the getEventTypes endpoint if the list is Event Types', async () => {
        store.commit('optionList/setList', EOptionLists.EventTypes);

        await store.dispatch('optionList/fetchItems');

        expect(store.$services.eventTypes.getEventTypes).toHaveBeenCalledTimes(1);
      });
    });

    describe('createOption', () => {
      it('throws an error if list is not set in the store', async () => {
        await expect(store.dispatch('optionList/createOption')).rejects.toThrow();
      });

      it('calls the createEventType endpoint if the list is Event Types', async () => {
        store.commit('optionList/setList', EOptionLists.EventTypes);

        await store.dispatch('optionList/createOption');

        expect(store.$services.eventTypes.createEventType).toHaveBeenCalledTimes(1);
      });
    });

    describe('updateName', () => {
      it('throws an error if list is not set in the store', async () => {
        await expect(store.dispatch('optionList/updateName')).rejects.toThrow();
      });

      it('calls the updateEventTypeName endpoint if the list is Event Types', async () => {
        store.commit('optionList/setList', EOptionLists.EventTypes);

        await store.dispatch('optionList/updateName', {
          id: 'ID',
          name: { translation: { en: 'EN NAME', fr: 'FR NAME' } },
        });

        expect(store.$services.eventTypes.updateEventTypeName).toHaveBeenCalledWith(
          'ID',
          { translation: { en: 'EN NAME', fr: 'FR NAME' } },
        );
      });
    });

    describe('updateStatus', () => {
      it('throws an error if list is not set in the store', async () => {
        await expect(store.dispatch('optionList/updateStatus')).rejects.toThrow();
      });

      it('calls the updateEventTypeStatus endpoint if the list is Event Types', async () => {
        store.commit('optionList/setList', EOptionLists.EventTypes);

        await store.dispatch('optionList/updateStatus', {
          id: 'ID',
          itemStatus: EOptionListItemStatus.Inactive,
        });

        expect(store.$services.eventTypes.updateEventTypeStatus).toHaveBeenCalledWith(
          'ID',
          EOptionListItemStatus.Inactive,
        );
      });
    });

    describe('updateOrderRanks', () => {
      it('throws an error if list is not set in the store', async () => {
        await expect(store.dispatch('optionList/updateOrderRanks')).rejects.toThrow();
      });

      it('calls the updateEventTypeOrderRanks endpoint if the list is Event Types', async () => {
        store.commit('optionList/setList', EOptionLists.EventTypes);

        const items = mockEventTypeData();

        await store.dispatch('optionList/updateOrderRanks', [
          items[2],
          items[0],
          items[1],
        ]);

        expect(store.$services.eventTypes.updateEventTypeOrderRanks).toHaveBeenCalledWith({
          [items[2].id]: 1,
          [items[0].id]: 2,
          [items[1].id]: 3,
        });
      });
    });

    describe('setIsOther', () => {
      it('throws an error if list is not set in the store', async () => {
        await expect(store.dispatch('optionList/setIsOther')).rejects.toThrow();
      });

      it('calls the setEventTypeIsOther endpoint if the list is Event Types', async () => {
        store.commit('optionList/setList', EOptionLists.EventTypes);

        await store.dispatch('optionList/setIsOther', {
          id: 'ID',
          isOther: true,
        });

        expect(store.$services.eventTypes.setEventTypeIsOther).toHaveBeenCalledWith(
          'ID',
          true,
        );
      });
    });

    describe('setIsDefault', () => {
      it('throws an error if list is not set in the store', async () => {
        await expect(store.dispatch('optionList/setIsDefault')).rejects.toThrow();
      });

      it('calls the setEventTypeIsDefault endpoint if the list is Event Types', async () => {
        store.commit('optionList/setList', EOptionLists.EventTypes);

        await store.dispatch('optionList/setIsDefault', {
          id: 'ID',
          isDefault: true,
        });

        expect(store.$services.eventTypes.setEventTypeIsDefault).toHaveBeenCalledWith(
          'ID',
          true,
        );
      });
    });
  });
});
