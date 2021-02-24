import {
  Module, ActionTree, Store, ActionContext,
} from 'vuex';

import { IRootState } from '@/store/store.types';

import { ITeam, ITeamData, Team } from '@/entities/team';
import { ISearchData } from '@/types';
import {
  IState,
} from './team.types';

const getDefaultState = (): IState => ({
  // dummy: '',
});

const moduleState: IState = getDefaultState();

const getters = {

};

const mutations = {

};

const actions = {
  async searchTeams(this: Store<IState>, context: ActionContext<IState, IState>, params: ISearchData): Promise<ITeam[]> {
    const data = await this.$services.teams.searchTeams(params);
    return data.map((el: ITeamData) => (new Team(el)));
  },
};

export const team: Module<IState, IRootState> = {
  namespaced: true,
  state: moduleState as IState,
  getters,
  mutations,
  actions: actions as unknown as ActionTree<IState, IRootState>,
};
