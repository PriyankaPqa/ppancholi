import {
  OptionItem, IOptionItem, EOptionLists, ICreateOptionItemRequest, IOptionSubItem,
} from '@libs/entities-lib/optionItem';
import { IStore, IState } from '@/store/store.types';
import { IMultilingual } from '@libs/core-lib/types';
import { Status } from '@libs/entities-lib/base';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore<IState>): IStorage => ({
  getters: {
    items(): Array<OptionItem> {
      return store.getters['optionList/items'];
    },
  },

  mutations: {
    setList(payload: EOptionLists) {
      store.commit('optionList/setList', payload);
    },

    resetState() {
      store.commit('optionList/resetState');
    },
  },

  actions: {
    fetchItems(): Promise<IOptionItem[]> {
      return store.dispatch('optionList/fetchItems');
    },

    fetchSubItems(): Promise<IOptionSubItem[]> {
      return store.dispatch('optionList/fetchSubItems');
    },

    createOption(payload: ICreateOptionItemRequest) {
      return store.dispatch('optionList/createOption', payload);
    },

    addSubItem(itemId: string, subItem: ICreateOptionItemRequest) {
      return store.dispatch('optionList/addSubItem', {
        itemId,
        subItem,
      });
    },

    updateItem(id: string, name: IMultilingual, description: IMultilingual) {
      return store.dispatch('optionList/updateItem', {
        id,
        name,
        description,
      });
    },

    updateSubItem(itemId: string, subItemId: string, name: IMultilingual, description: IMultilingual) {
      return store.dispatch('optionList/updateSubItem', {
        itemId,
        subItemId,
        name,
        description,
      });
    },

    updateStatus(id: string, status: Status) {
      return store.dispatch('optionList/updateStatus', {
        id,
        status,
      });
    },

    updateSubItemStatus(itemId: string, subItemId: string, status: Status) {
      return store.dispatch('optionList/updateSubItemStatus', {
        itemId,
        subItemId,
        status,
      });
    },

    updateOrderRanks(payload: Array<IOptionItem>) {
      return store.dispatch('optionList/updateOrderRanks', payload);
    },

    updateSubItemOrderRanks(newItem: IOptionSubItem) {
      return store.dispatch('optionList/updateSubItemOrderRanks', newItem);
    },

    setIsOther(id: string, isOther: boolean) {
      return store.dispatch('optionList/setIsOther', {
        id,
        isOther,
      });
    },

    setIsDefault(id: string, isDefault: boolean) {
      return store.dispatch('optionList/setIsDefault', {
        id,
        isDefault,
      });
    },
  },
});
