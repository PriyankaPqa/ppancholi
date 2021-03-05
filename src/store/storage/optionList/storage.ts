import {
  IOptionItem, EOptionListItemStatus, EOptionLists, ICreateOptionItemRequest,
} from '@/entities/optionItem';
import { IStore } from '@/store/store.types';
import { IMultilingual } from '@/types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore): IStorage => ({
  getters: {
    items(): Array<IOptionItem> {
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

    createOption(payload: ICreateOptionItemRequest) {
      return store.dispatch('optionList/createOption', payload);
    },

    updateName(id: string, name: IMultilingual) {
      return store.dispatch('optionList/updateName', {
        id,
        name,
      });
    },

    updateStatus(id: string, itemStatus: EOptionListItemStatus) {
      return store.dispatch('optionList/updateStatus', {
        id,
        itemStatus,
      });
    },

    updateOrderRanks(payload: Array<IOptionItem>) {
      return store.dispatch('optionList/updateOrderRanks', payload);
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
