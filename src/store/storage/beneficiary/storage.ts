import { IStore } from '@/store/store.types';
import { IAddresses, IPersonalInformation } from '@/entities/beneficiary';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore): IStorage => ({
  getters: {
    beneficiary() {
      return store.getters['beneficiary/beneficiary'];
    },
  },
  mutations: {
    setPersonalInformation(payload: IPersonalInformation) {
      store.commit('beneficiary/setPersonalInformation', payload);
    },

    setAddresses(payload: IAddresses) {
      store.commit('beneficiary/setAddresses', payload);
    },
  },

  actions: {

  },
});
