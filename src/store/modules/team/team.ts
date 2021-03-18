import {
  Module, ActionTree, Store, ActionContext,
} from 'vuex';

import { IRootState } from '@/store/store.types';

import {
  ITeam, ITeamData, ITeamSearchData, Team,
} from '@/entities/team';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { IAppUserData } from '@/entities/app-user';
import {
  IState,
} from './team.types';

const getDefaultState = (): IState => ({
  addTeamMemberLoading: false,
  submitLoading: false,
  searchLoading: false,
  getLoading: false,
  removeLoading: false,
  teamId: null,
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

const mutations = {
  setGetLoading(state: IState, payload: boolean) {
    state.getLoading = payload;
  },

  setSubmitLoading(state: IState, payload: boolean) {
    state.submitLoading = payload;
  },

  setAddTeamMemberLoading(state: IState, payload: boolean) {
    state.addTeamMemberLoading = payload;
  },

  setSearchLoading(state: IState, payload: boolean) {
    state.searchLoading = payload;
  },

  setTeamId(state: IState, payload: uuid) {
    state.teamId = payload;
  },

};

const actions = {

  async getTeam(this: Store<IState>, context: ActionContext<IState, IState>, id: uuid): Promise<ITeam> {
    context.commit('setGetLoading', true);
    try {
      const res = await this.$services.teams.searchTeams({ filter: { TeamId: id } });
      const team = res.value[0];
      context.commit('setTeamId', team.teamId);
      return new Team(teamSearchDataToTeamData(team));
    } finally {
      context.commit('setGetLoading', false);
    }
  },

  async createTeam(this: Store<IState>, context: ActionContext<IState, IState>, payload: ITeam): Promise<ITeam> {
    context.commit('setSubmitLoading', true);
    try {
      const res = await this.$services.teams.createTeam(payload);
      return new Team(res);
    } finally {
      context.commit('setSubmitLoading', false);
    }
  },

  async editTeam(this: Store<IState>, context: ActionContext<IState, IState>, payload: ITeam): Promise<ITeam> {
    context.commit('setSubmitLoading', true);
    try {
      const res = await this.$services.teams.editTeam(payload);
      return new Team(res);
    } finally {
      context.commit('setSubmitLoading', false);
    }
  },

  async searchTeams(
    this: Store<IState>,
    context: ActionContext<IState, IState>,
    params: IAzureSearchParams,
  ): Promise<IAzureSearchResult<ITeamSearchData>> {
    try {
      context.commit('setSearchLoading', true);
      return await this.$services.teams.searchTeams(params);
    } finally {
      context.commit('setSearchLoading', false);
    }
  },

  async addTeamMembers(
    this: Store<IState>,
    context: ActionContext<IState, IState>,
    payload: { teamId: uuid, teamMembers: IAppUserData[] },
  ): Promise<ITeam> {
    context.commit('setAddTeamMemberLoading', true);
    try {
      const res = await this.$services.teams.addTeamMembers(payload.teamId, payload.teamMembers);
      return new Team(res);
    } finally {
      context.commit('setAddTeamMemberLoading', false);
    }
  },

  async removeTeamMember(
    this: Store<IState>,
    context: ActionContext<IState, IState>,
    payload: { teamId: uuid, teamMemberId: uuid },
  ): Promise<ITeam> {
    context.state.removeLoading = true;
    try {
      const res = await this.$services.teams.removeTeamMember(payload.teamId, payload.teamMemberId);
      return new Team(res);
    } finally {
      context.state.removeLoading = false;
    }
  },

};

export const team: Module<IState, IRootState> = {
  namespaced: true,
  state: moduleState as IState,
  actions: actions as unknown as ActionTree<IState, IRootState>,
  mutations,
};
