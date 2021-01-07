import { IStore } from '@/store/store.types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore): IStorage => ({
  mutations: {
    setProperty({ property, value }) {
      store.commit('dashboard/setProperty', { property, value });
    },
  },
});
