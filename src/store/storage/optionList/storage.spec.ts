import { mockOptionItemData, EOptionListItemStatus, EOptionLists } from '@/entities/optionItem';
import { mockStore } from '@/store';
import { makeStorage } from './storage';

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
        itemStatus: EOptionListItemStatus.Active,
      };
      storage.actions.createOption(optionListItem);
      expect(store.dispatch).toHaveBeenCalledWith('optionList/createOption', optionListItem);
    });

    it('should proxy updateName', () => {
      const name = { translation: { en: 'EN', fr: 'FR' } };
      storage.actions.updateName('ID', name);
      expect(store.dispatch).toHaveBeenCalledWith('optionList/updateName', { id: 'ID', name });
    });

    it('should proxy updateStatus', () => {
      storage.actions.updateStatus('ID', EOptionListItemStatus.Inactive);
      expect(store.dispatch).toHaveBeenCalledWith('optionList/updateStatus', { id: 'ID', itemStatus: EOptionListItemStatus.Inactive });
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
