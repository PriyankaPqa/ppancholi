import { Module, ActionTree } from 'vuex';
import { IRootState } from '@/store/store.types';

import _cloneDeep from 'lodash/cloneDeep';
import _merge from 'lodash/merge';
import { IdentitySet, IIdentitySetData } from '../../../entities/value-objects/identity-set';
import {
  HouseholdCreate,
  ContactInformation,
  IAddress,
  IContactInformation,
  IMember, ICurrentAddress,
  Member,
} from '../../../entities/household-create';

import { IState } from './household.types';

const getDefaultState = (): IState => ({
  householdCreate: new HouseholdCreate(),
});

const moduleState: IState = getDefaultState();

const getters = {
  householdCreate: (state: IState) => _cloneDeep(state.householdCreate),
  personalInformation: (state: IState) => _cloneDeep(
    _merge(state.householdCreate.primaryBeneficiary.contactInformation, state.householdCreate.primaryBeneficiary.identitySet),
  ),
};

const mutations = {
  setPersonalInformation(state: IState, payload: IContactInformation & IdentitySet) {
    state.householdCreate.primaryBeneficiary.contactInformation = new ContactInformation(_cloneDeep(payload));
    state.householdCreate.primaryBeneficiary.identitySet = new IdentitySet(_cloneDeep(payload));
  },

  setPrimaryBeneficiary(state: IState, payload: IMember) {
    state.householdCreate.primaryBeneficiary = new Member(_cloneDeep(payload));
  },

  setIdentity(state: IState, payload: IIdentitySetData) {
    state.householdCreate.primaryBeneficiary.identitySet.setIdentity(_cloneDeep(payload));
  },

  setIndigenousIdentity(state: IState, payload: IIdentitySetData) {
    state.householdCreate.primaryBeneficiary.identitySet.setIndigenousIdentity(_cloneDeep(payload));
  },

  setContactInformation(state: IState, payload: IContactInformation) {
    state.householdCreate.primaryBeneficiary.contactInformation = new ContactInformation(_cloneDeep(payload));
  },

  setCurrentAddress(state: IState, payload: ICurrentAddress) {
    state.householdCreate.primaryBeneficiary.currentAddress = _cloneDeep(payload);
  },

  setHomeAddress(state: IState, payload: IAddress) {
    state.householdCreate.homeAddress = _cloneDeep(payload);
  },

  setNoFixedHome(state: IState, payload: boolean) {
    state.householdCreate.noFixedHome = payload;
  },

  addAdditionalMember(state: IState, { payload, sameAddress }: {payload: IMember; sameAddress: boolean}) {
    state.householdCreate.addAdditionalMember(payload, sameAddress);
  },

  removeAdditionalMember(state: IState, index: number) {
    state.householdCreate.removeAdditionalMember(index);
  },

  editAdditionalMember(state: IState, { payload, index, sameAddress }: {payload: IMember; index: number; sameAddress: boolean}) {
    state.householdCreate.editAdditionalMember(_cloneDeep(payload), index, sameAddress);
  },

  resetState(state: IState) {
    state.householdCreate = new HouseholdCreate();
  },

};

const actions = {

};

export const makeHouseholdModule = (): Module<IState, IRootState> => ({
  namespaced: true,
  state: moduleState as IState,
  getters,
  mutations,
  actions: (actions as unknown) as ActionTree<IState, IRootState>,
});
