import { IStore } from '@/store/store.types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore): IStorage => ({
  getters: {
    appUsersWithInfo() {
      return store.getters['appUser/appUsersWithInfo'];
    },
    appUserWhere(key: string, value: string) {
      return store.getters['appUser/appUserWhere'](key, value);
    },
    appUserWithNameContaining(searchTerm: string) {
      return store.getters['appUser/appUserWithNameContaining'](searchTerm);
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
