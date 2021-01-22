import { Module } from 'vuex';
import { IRootState } from '../../store.types';
import { IState } from './dashboard.types';

const getDefaultState = (): IState => ({
  leftMenuExpanded: false,
  leftMenuVisible: false,
  rightMenuVisible: false,
  generalHelpMenuVisible: false,
});

const moduleState = getDefaultState();
const mutations = {
  setProperty: (state: IState, { property, value }: { property: keyof IState, value: boolean }) => {
    state[property] = value;
  },
};

export const dashboard: Module<IState, IRootState> = {
  namespaced: true,
  state: moduleState,
  mutations,
};
