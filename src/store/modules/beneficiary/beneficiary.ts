import { Module, ActionTree } from 'vuex';
import { IRootState } from '@/store/store.types';

import {
  Beneficiary,
  ContactInformation,
  ETemporaryAddressTypes,
  IAddress,
  IContactInformation,
  IPerson, ITemporaryAddress,
  Person,
  TemporaryAddress,
} from '@/entities/beneficiary';
import _cloneDeep from 'lodash/cloneDeep';
import _merge from 'lodash/merge';

import { IState } from './beneficiary.types';

const getDefaultState = (): IState => ({
  noFixedHome: false,
  beneficiary: new Beneficiary(),
});

const moduleState: IState = getDefaultState();

const getters = {
  beneficiary: (state: IState) => _cloneDeep(state.beneficiary),
  personalInformation: (state: IState) => _merge(_cloneDeep(state.beneficiary.contactInformation), _cloneDeep(state.beneficiary.person)),
};

const mutations = {
  setPersonalInformation(state: IState, payload: IContactInformation & IPerson) {
    state.beneficiary.contactInformation = new ContactInformation(_cloneDeep(payload));
    state.beneficiary.person = new Person(_cloneDeep(payload));
  },

  setTemporaryAddress(state: IState, payload: ITemporaryAddress) {
    state.beneficiary.person.temporaryAddress = _cloneDeep(payload);
  },

  resetTemporaryAddress(state: IState, type: ETemporaryAddressTypes) {
    const newAddress = new TemporaryAddress();
    newAddress.temporaryAddressType = type;
    state.beneficiary.person.temporaryAddress = _cloneDeep(newAddress);
  },

  setHomeAddress(state: IState, payload: IAddress) {
    state.beneficiary.homeAddress = _cloneDeep(payload);
  },

  setNoFixedHome(state: IState, payload: boolean) {
    state.noFixedHome = payload;
  },

};

const actions = {

};

export const beneficiary: Module<IState, IRootState> = {
  namespaced: true,
  state: moduleState as IState,
  getters,
  mutations,
  actions: (actions as unknown) as ActionTree<IState, IRootState>,
};
