import { Module, ActionTree } from 'vuex';
import { IRootState } from '@/store/store.types';

import _cloneDeep from 'lodash/cloneDeep';
import _merge from 'lodash/merge';
import {
  Beneficiary,
  ContactInformation,
  IAddress,
  IContactInformation,
  IPerson, ITemporaryAddress,
  Person,
} from '../../../entities/beneficiary';

import { IState } from './beneficiary.types';

const getDefaultState = (): IState => ({
  beneficiary: new Beneficiary(),
});

const moduleState: IState = getDefaultState();

const getters = {
  beneficiary: (state: IState) => _cloneDeep(state.beneficiary),
  personalInformation: (state: IState) => _cloneDeep(_merge(state.beneficiary.contactInformation, state.beneficiary.person)),
};

const mutations = {
  setPersonalInformation(state: IState, payload: IContactInformation & IPerson) {
    state.beneficiary.contactInformation = new ContactInformation(_cloneDeep(payload));
    state.beneficiary.person = new Person(_cloneDeep(payload));
  },

  setPerson(state: IState, payload: IPerson) {
    state.beneficiary.person = new Person(_cloneDeep(payload));
  },

  setIdentity(state: IState, payload: IPerson) {
    state.beneficiary.person.setIdentity(_cloneDeep(payload));
  },

  setIndigenousIdentity(state: IState, payload: IPerson) {
    state.beneficiary.person.setIndigenousIdentity(_cloneDeep(payload));
  },

  setContactInformation(state: IState, payload: IContactInformation) {
    state.beneficiary.contactInformation = new ContactInformation(_cloneDeep(payload));
  },

  setTemporaryAddress(state: IState, payload: ITemporaryAddress) {
    state.beneficiary.person.temporaryAddress = _cloneDeep(payload);
  },

  setHomeAddress(state: IState, payload: IAddress) {
    state.beneficiary.homeAddress = _cloneDeep(payload);
  },

  setNoFixedHome(state: IState, payload: boolean) {
    state.beneficiary.noFixedHome = payload;
  },

  addHouseholdMember(state: IState, { payload, sameAddress }: {payload: IPerson; sameAddress: boolean}) {
    state.beneficiary.addHouseholdMember(payload, sameAddress);
  },

  removeHouseholdMember(state: IState, index: number) {
    state.beneficiary.removeHouseholdMember(index);
  },

  editHouseholdMember(state: IState, { payload, index, sameAddress }: {payload: IPerson; index: number; sameAddress: boolean}) {
    state.beneficiary.editHouseholdMember(_cloneDeep(payload), index, sameAddress);
  },

  resetState(state: IState) {
    state.beneficiary = new Beneficiary();
  },

};

const actions = {

};

export const makeBeneficiaryModule = (): Module<IState, IRootState> => ({
  namespaced: true,
  state: moduleState as IState,
  getters,
  mutations,
  actions: (actions as unknown) as ActionTree<IState, IRootState>,
});
