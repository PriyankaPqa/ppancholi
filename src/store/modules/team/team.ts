import {
  Module, ActionTree, Store, ActionContext,
} from 'vuex';

import { IRootState } from '@/store/store.types';

import {
  ITeam, ITeamData, Team,
} from '@/entities/team';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import {
  IState,
} from './team.types';

const getDefaultState = (): IState => ({
  loading: false,
  searchLoading: false,
});

const moduleState: IState = getDefaultState();

const getters = {
  loading: (state: IState) => state.loading,
};

const mutations = {

};

const actions = {

  async getTeam(this: Store<IState>, context: ActionContext<IState, IState>, id: uuid): Promise<ITeam> {
    context.state.loading = true;
    try {
      const res = await this.$services.teams.getTeam(id);
      return new Team(res);
    } finally {
      context.state.loading = false;
    }
  },

  async createTeam(this: Store<IState>, context: ActionContext<IState, IState>, payload: ITeam): Promise<ITeam> {
    context.state.loading = true;
    try {
      const res = await this.$services.teams.createTeam(payload);
      return new Team(res);
    } finally {
      context.state.loading = false;
    }
  },

  async editTeam(this: Store<IState>, context: ActionContext<IState, IState>, payload: ITeam): Promise<ITeam> {
    context.state.loading = true;
    try {
      const res = await this.$services.teams.editTeam(payload);
      return new Team(res);
    } finally {
      context.state.loading = false;
    }
  },

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
