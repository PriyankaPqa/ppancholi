import { IStore } from '@/store/store.types';
import { IAddresses, IContactInformation, IPerson } from '@/entities/beneficiary';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore): IStorage => ({
  getters: {
    beneficiary() {
      return store.getters['beneficiary/beneficiary'];
    },

    personalInformation() {
      return store.getters['beneficiary/personalInformation'];
    },
  },
  mutations: {
    setPersonalInformation(payload: IContactInformation & IPerson) {
      store.commit('beneficiary/setPersonalInformation', payload);
    },

    setAddresses(payload: IAddresses) {
      store.commit('beneficiary/setAddresses', payload);
    },
  },

  actions: {

  },
});
