import {
  EFilterKey, IFilter, IUser, IUserData,
} from '@/entities/user';
import { IStore } from '@/store/store.types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore): IStorage => ({
  getters: {
    user(): IUser {
      return store.getters['user/user'];
    },

    landingPage(): string {
      return store.getters['user/landingPage'];
    },

    filtersByKey(key: EFilterKey) {
      return store.getters['user/filtersByKey'](key);
    },
  },

  mutations: {
    setUser(payload: IUserData) {
      store.commit('user/setUser', payload);
    },

    setFilters(payload: Array<IFilter>) {
      store.commit('user/setFilters', payload);
    },
  },

  actions: {
    signOut() {
      store.dispatch('user/signOut');
    },

    fetchUserData() {
      store.dispatch('user/fetchUserData');
    },
  },
});
