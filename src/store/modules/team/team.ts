import {
  Module, ActionTree, Store, ActionContext,
} from 'vuex';

import { IRootState } from '@/store/store.types';

import {
  ITeam, ITeamData, ITeamSearchData, Team,
} from '@/entities/team';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import {
  IState,
} from './team.types';

const getDefaultState = (): IState => ({
  submitLoading: false,
  searchLoading: false,
  getLoading: false,
});

const moduleState: IState = getDefaultState();

const teamSearchDataToTeamData = (teamSearchData: ITeamSearchData): ITeamData => ({
  id: teamSearchData.teamId,
  name: teamSearchData.teamName,
  teamType: teamSearchData.teamType,
  status: teamSearchData.teamStatus,
  teamMembers: teamSearchData.teamMembers,
  events: teamSearchData.events,
});

const actions = {

  async getTeam(this: Store<IState>, context: ActionContext<IState, IState>, id: uuid): Promise<ITeam> {
    context.state.getLoading = true;
    try {
      const res = await this.$services.teams.searchTeams({ filter: { TeamId: id } });
      const team = res.value[0];
      return new Team(teamSearchDataToTeamData(team));
    } finally {
      context.state.getLoading = false;
    }
  },

  async createTeam(this: Store<IState>, context: ActionContext<IState, IState>, payload: ITeam): Promise<ITeam> {
    context.state.submitLoading = true;
    try {
      const res = await this.$services.teams.createTeam(payload);
      return new Team(res);
    } finally {
      context.state.submitLoading = false;
    }
  },

  async editTeam(this: Store<IState>, context: ActionContext<IState, IState>, payload: ITeam): Promise<ITeam> {
    context.state.submitLoading = true;
    try {
      const res = await this.$services.teams.editTeam(payload);
      return new Team(res);
    } finally {
      context.state.submitLoading = false;
    }
  },

  async searchTeams(
    this: Store<IState>,
    context: ActionContext<IState, IState>,
    params: IAzureSearchParams,
  ): Promise<IAzureSearchResult<ITeamSearchData>> {
    try {
      context.state.searchLoading = true;
      const res = await this.$services.teams.searchTeams(params);
      return res;
    } finally {
      context.state.searchLoading = false;
    }
  },

};

export const team: Module<IState, IRootState> = {
  namespaced: true,
  state: moduleState as IState,
  actions: actions as unknown as ActionTree<IState, IRootState>,
};
