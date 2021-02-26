import {
  Module, ActionTree, Store, ActionContext,
} from 'vuex';

import { IRootState } from '@/store/store.types';

import { ITeamData, Team, ITeam } from '@/entities/team';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import {
  IState,
} from './team.types';

const getDefaultState = (): IState => ({
  searchLoading: false,
});

const moduleState: IState = getDefaultState();

const getters = {

};

const mutations = {

};

const actions = {
  async searchTeams(this: Store<IState>, context: ActionContext<IState, IState>, params: IAzureSearchParams): Promise<IAzureSearchResult<ITeam>> {
    try {
      context.state.searchLoading = true;
      const res = await this.$services.teams.searchTeams(params);
      const data = res?.value;
      return {
        ...res,
        value: data.map((el: ITeamData) => (new Team(el))),
      };
    } finally {
      context.state.searchLoading = false;
    }
  },
};

export const team: Module<IState, IRootState> = {
  namespaced: true,
  state: moduleState as IState,
  getters,
  mutations,
  actions: actions as unknown as ActionTree<IState, IRootState>,
};
