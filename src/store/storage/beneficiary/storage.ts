import { IStore } from '@/store/store.types';
import {
  ETemporaryAddressTypes,
  IAddress, IContactInformation, IPerson, ITemporaryAddress,
} from '@/entities/beneficiary';
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

    setHomeAddress(payload: IAddress) {
      store.commit('beneficiary/setHomeAddress', payload);
    },

    setTemporaryAddress(payload: ITemporaryAddress) {
      store.commit('beneficiary/setTemporaryAddress', payload);
    },

    resetTemporaryAddress(type: ETemporaryAddressTypes) {
      store.commit('beneficiary/resetTemporaryAddress', type);
    },

    setNoFixedHome(payload: boolean) {
      store.commit('beneficiary/setNoFixedHome', payload);
    },
  },

  actions: {

  },
});
