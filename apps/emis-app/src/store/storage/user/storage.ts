import {
  IUser, IUserData,
} from '@/entities/user';
import { IStore, IState } from '@/store/store.types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore<IState>): IStorage => ({
  getters: {
    user(): IUser {
      return store.getters['user/user'];
    },

    userId(): uuid {
      return store.getters['user/userId'];
    },

    landingPage(): string {
      return store.getters['user/landingPage'];
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

    getCurrentRoles: (): Promise<string[]> => store.dispatch('user/getCurrentRoles'),

    isRoleChanged: (currentRoles: string[]): Promise<boolean> => store.dispatch('user/isRoleChanged', currentRoles),
  },
});
