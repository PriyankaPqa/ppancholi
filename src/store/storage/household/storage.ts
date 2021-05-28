import { IStore, IState } from '@/store/store.types';
import {
  IAddress, IContactInformation, IMember, ICurrentAddress, IIdentitySetData,
} from '../../../entities/household-create';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore<IState>): IStorage => ({
  getters: {
    householdCreate() {
      return store.getters['household/householdCreate'];
    },

    personalInformation() {
      return store.getters['household/personalInformation'];
    },
  },
  mutations: {
    setPersonalInformation(payload: IContactInformation & IMember) {
      store.commit('household/setPersonalInformation', payload);
    },

    setPrimaryBeneficiary(payload: IMember) {
      store.commit('household/setPrimaryBeneficiary', payload);
    },

    setIdentity(payload: IIdentitySetData) {
      store.commit('household/setIdentity', payload);
    },

    setIndigenousIdentity(payload: IIdentitySetData) {
      store.commit('household/setIndigenousIdentity', payload);
    },

    setContactInformation(payload: IContactInformation) {
      store.commit('household/setContactInformation', payload);
    },

    setHomeAddress(payload: IAddress) {
      store.commit('household/setHomeAddress', payload);
    },

    setCurrentAddress(payload: ICurrentAddress) {
      store.commit('household/setCurrentAddress', payload);
    },

    setNoFixedHome(payload: boolean) {
      store.commit('household/setNoFixedHome', payload);
    },

    addAdditionalMember(payload: IMember, sameAddress: boolean) {
      store.commit('household/addAdditionalMember', { payload, sameAddress });
    },

    removeAdditionalMember(index: number) {
      store.commit('household/removeAdditionalMember', index);
    },

    editAdditionalMember(payload: IMember, index: number, sameAddress: boolean) {
      store.commit('household/editAdditionalMember', { payload, index, sameAddress });
    },

    resetState() {
      store.commit('household/resetState');
    },

  },

  actions: {

  },
});
