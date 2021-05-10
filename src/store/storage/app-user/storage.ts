import { IStore, IState } from '@/store/store.types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore<IState>): IStorage => ({

  mutations: {
    invalidateAppUserCache() {
      store.commit('appUser/invalidateAppUserCache');
    },
  },

  getters: {
    appUsersWithInfo() {
      return store.getters['appUser/appUsersWithInfo'];
    },

    appUserWhere(key: string, value: string) {
      return store.getters['appUser/appUserWhere'](key, value);
    },

    searchAppUser(searchTerm: string, searchAll = true, searchAmong: Array<string>) {
      return store.getters['appUser/searchAppUser'](searchTerm, searchAll, searchAmong);
    },
  },

  actions: {
    fetchAllUsers() {
      return store.dispatch('appUser/fetchAllUsers');
    },

    fetchAppUsers() {
      return store.dispatch('appUser/fetchAppUsers');
    },

    fetchRoles() {
      return store.dispatch('appUser/fetchRoles');
    },
  },
});
