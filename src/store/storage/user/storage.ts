import { IUser, IUserData } from '@/entities/user';
import { IStore } from '@/store/store.types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore): IStorage => ({
  getters: {
    user(): IUser {
      return store.getters['user/user'];
    },
  },

  mutations: {
    setUser(payload: IUserData) {
      store.commit('user/setUser', payload);
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
