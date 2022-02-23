/**
 * @group storage
 */

import {
  mockOptionItemData, mockSubItem, EOptionLists,
} from '@/entities/optionItem';
import { mockStore } from '@/store';
import { makeStorage } from './storage';

import { Status } from '@/entities/base';

const store = mockStore({}, { commit: true, dispatch: true });
const storage = makeStorage(store);

describe('>>> OptionList Storage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('>> Getters', () => {
    it('should proxy items', () => {
      expect(storage.getters.items()).toEqual(store.getters['optionList/items']);
    });
  });

  describe('>> Mutations', () => {
    it('should proxy setList', () => {
      storage.mutations.setList(EOptionLists.EventTypes);
      expect(store.commit).toHaveBeenCalledWith('optionList/setList', EOptionLists.EventTypes);
    });

    it('should proxy resetState', () => {
      storage.mutations.resetState();
      expect(store.commit).toHaveBeenCalledWith('optionList/resetState');
    });
  });

  describe('>> Actions', () => {
    it('should proxy fetchItems', () => {
      storage.actions.fetchItems();
      expect(store.dispatch).toHaveBeenCalledWith('optionList/fetchItems');
    });

    it('should proxy createOption', () => {
      const optionListItem = {
        id: 'ID',
        name: {
          translation: {
            en: 'EN',
            fr: 'FR',
          },
        },
        orderRank: 1,
        status: Status.Active,
      };
      storage.actions.createOption(optionListItem);
      expect(store.dispatch).toHaveBeenCalledWith('optionList/createOption', optionListItem);
    });

    it('should proxy addSubItem', () => {
      const itemId = 'item id';
      const subItem = mockSubItem();

      storage.actions.addSubItem(itemId, subItem);
      expect(store.dispatch).toHaveBeenCalledWith('optionList/addSubItem', { itemId, subItem });
    });

    it('should proxy updateItem', () => {
      const name = { translation: { en: 'EN', fr: 'FR' } };
      const description = { translation: { en: 'desc EN', fr: 'desc FR' } };
      storage.actions.updateItem('ID', name, description);
      expect(store.dispatch).toHaveBeenCalledWith('optionList/updateItem', { id: 'ID', name, description });
    });

    it('should proxy updateSubItem', () => {
      const itemId = 'item id';
      const subItemId = 'subItemId';
      const name = { translation: { en: 'name EN', fr: 'name FR' } };
      const description = { translation: { en: 'description EN', fr: 'description FR' } };
      storage.actions.updateSubItem(itemId, subItemId, name, description);
      expect(store.dispatch).toHaveBeenCalledWith('optionList/updateSubItem', {
        itemId, subItemId, name, description,
      });
    });

    it('should proxy updateStatus', () => {
      storage.actions.updateStatus('ID', Status.Inactive);
      expect(store.dispatch).toHaveBeenCalledWith('optionList/updateStatus', { id: 'ID', status: Status.Inactive });
    });

    it('should proxy updateSubItemStatus', () => {
      const itemId = 'itemId';
      const subItemId = 'subItemId';
      const status = Status.Inactive;
      storage.actions.updateSubItemStatus(itemId, subItemId, status);
      expect(store.dispatch).toHaveBeenCalledWith('optionList/updateSubItemStatus', { itemId, subItemId, status });
    });

    it('should proxy updateOrderRanks', () => {
      const items = mockOptionItemData();

      storage.actions.updateOrderRanks([
        items[1],
        items[0],
        items[2],
      ]);

      expect(store.dispatch).toHaveBeenCalledWith('optionList/updateOrderRanks', [
        items[1],
        items[0],
        items[2],
      ]);
    });

    it('should proxy updateSubItemOrderRanks', () => {
      const newItem = mockOptionItemData()[0];

      storage.actions.updateSubItemOrderRanks(newItem);

      expect(store.dispatch).toHaveBeenCalledWith('optionList/updateSubItemOrderRanks', newItem);
    });

    it('should proxy setIsOther', () => {
      storage.actions.setIsOther('ID', true);
      expect(store.dispatch).toHaveBeenCalledWith('optionList/setIsOther', { id: 'ID', isOther: true });
    });

    it('should proxy setIsDefault', () => {
      storage.actions.setIsDefault('ID', true);
      expect(store.dispatch).toHaveBeenCalledWith('optionList/setIsDefault', { id: 'ID', isDefault: true });
    });
  });
});
