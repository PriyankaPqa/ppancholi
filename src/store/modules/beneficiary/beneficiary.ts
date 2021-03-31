import { Module, ActionTree } from 'vuex';
import { IRootState } from '@/store/store.types';

import { Beneficiary, IAddresses, IPersonalInformation } from '@/entities/beneficiary';
import _cloneDeep from 'lodash/cloneDeep';

import { IState } from './beneficiary.types';

const getDefaultState = (): IState => ({
  beneficiary: new Beneficiary(),
});

const moduleState: IState = getDefaultState();

const getters = {
  beneficiary: (state: IState) => _cloneDeep(state.beneficiary),
};

const mutations = {
  setPersonalInformation(state: IState, payload: IPersonalInformation) {
    state.beneficiary.personalInformation = _cloneDeep(payload);
  },

  setAddresses(state: IState, payload: IAddresses) {
    state.beneficiary.addresses = _cloneDeep(payload);
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
