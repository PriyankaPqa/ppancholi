import { Module, ActionTree } from 'vuex';
import { IRootState } from '@/store/store.types';

import {
  Beneficiary,
  ContactInformation,
  IAddress,
  IContactInformation,
  IPerson, ITemporaryAddress,
  Person,
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
  personalInformation: (state: IState) => _cloneDeep(_merge(state.beneficiary.contactInformation, state.beneficiary.person)),
};

const mutations = {
  setPersonalInformation(state: IState, payload: IContactInformation & IPerson) {
    state.beneficiary.contactInformation = new ContactInformation(_cloneDeep(payload));
    state.beneficiary.person = new Person(_cloneDeep(payload));
  },

  setTemporaryAddress(state: IState, payload: ITemporaryAddress) {
    state.beneficiary.person.temporaryAddress = _cloneDeep(payload);
  },

  setHomeAddress(state: IState, payload: IAddress) {
    state.beneficiary.homeAddress = _cloneDeep(payload);
  },

  setNoFixedHome(state: IState, payload: boolean) {
    state.noFixedHome = payload;
  },

  addHouseholdMember(state: IState, { payload, sameAddress }: {payload: IPerson; sameAddress: boolean}) {
    state.beneficiary.addHouseholdMember(payload, sameAddress);
  },

  removeHouseholdMember(state: IState, index: number) {
    state.beneficiary.removeHouseholdMember(index);
  },

  editHouseholdMember(state: IState, { payload, index, sameAddress }: {payload: IPerson; index: number; sameAddress: boolean}) {
    state.beneficiary.editHouseholdMember(payload, index, sameAddress);
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
