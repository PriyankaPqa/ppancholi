import { Module } from 'vuex';
import { IRootState } from '../../store.types';
import { IMutations, IState } from './dashboard.types';

const getDefaultState = (): IState => ({
  leftMenuExpanded: false,
  leftMenuVisible: false,
  rightMenuVisible: false,
  generalHelpMenuVisible: false,
});

const moduleState = getDefaultState();

const mutations: IMutations = {
  setProperty: (state: IState, { property, value }) => {
    state[property] = value;
  },
};

export const dashboard: Module<IState, IRootState> = {
  namespaced: true,
  state: moduleState,
  mutations,
};
