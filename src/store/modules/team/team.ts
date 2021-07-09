import {
  Module, ActionTree, Store, ActionContext,
} from 'vuex';

import { IRootState } from '@/store/store.types';

import {
  ITeam, ITeamMemberData, ITeamSearchData, ITeamSearchDataAggregate, Team,
} from '@/entities/team';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import _cloneDeep from 'lodash/cloneDeep';
import { IState } from './team.types';

import { buildTeamSearchDataPayload, aggregateTeamSearchDataWithMembers } from './teamUtils';

const getDefaultState = (): IState => ({
  submitLoading: false, // used when adding members and saving
  searchLoading: false, // used in team list table
  getLoading: false, // used when loading a team
  removeLoading: false, // used when removing a member
  team: new Team(),
  cachedTeams: [],
});

const moduleState: IState = getDefaultState();

const getters = {
  team: (state: IState) => _cloneDeep(state.team),
};

const mutations = {
  setGetLoading(state: IState, payload: boolean) {
    state.getLoading = payload;
  },

  setSubmitLoading(state: IState, payload: boolean) {
    state.submitLoading = payload;
  },

  setSearchLoading(state: IState, payload: boolean) {
    state.searchLoading = payload;
  },

  setRemoveLoading(state: IState, payload: boolean) {
    state.removeLoading = payload;
  },

  setTeam(state: IState, payload: ITeamSearchDataAggregate) {
    state.team = new Team(payload);
  },

  setCachedTeams(state: IState, payload: ITeamSearchData[]) {
    state.cachedTeams = payload;
  },

  resetTeam(state: IState) {
    state.team = new Team();
  },

  removeTeamMember(state: IState, id: uuid) {
    state.team.removeTeamMember(id);
  },

  addTeamMembers(state: IState, teamMembers: ITeamMemberData[]) {
    state.team.addTeamMembers(teamMembers);
  },
};

const actions = {
  async getTeam(this: Store<IState>, context: ActionContext<IState, IRootState>, id: uuid): Promise<ITeam> {
    context.commit('setGetLoading', true);
    try {
      // TODO - uncomment when Signal R is ready to leverage cached teams
      // const cachedTeam = context.state.cachedTeams.find((team) => team.teamId === id);
      //
      // if (cachedTeam) {
      //   context.commit('setTeam', cachedTeam);
      // } else {
      //   const res = await this.$services.teams.searchTeams({ filter: { TeamId: id } });
      //   context.commit('setTeam', res.value[0]);
      // }

      // TODO - Remove when signal R is ready
      const res = await this.$services.teams.searchTeams({ filter: { TeamId: id } });
      if (res && res.value && res.value[0]) {
        const team = res.value[0];

        const aggregate = await aggregateTeamSearchDataWithMembers(context, team);

        context.commit('setTeam', aggregate);
      }

      return context.state.team;
    } finally {
      context.commit('setGetLoading', false);
    }
  },

  async getTeamsAssignable(this: Store<IState>, context: ActionContext<IState, IRootState>, eventId: uuid): Promise<ITeam[]> {
    const teams = await this.$services.teams.getTeamsAssignable(eventId);
    if (teams && teams.length) {
      const aggregatedTeams = await Promise.all(
        teams.map(async (t) => {
          const team = await buildTeamSearchDataPayload(t, context);
          return new Team(team);
        }),
      );
      return aggregatedTeams;
    }
    return [];
  },

  async createTeam(this: Store<IState>, context: ActionContext<IState, IRootState>, payload: ITeam): Promise<ITeam> {
    context.commit('setSubmitLoading', true);
    try {
      const res = await this.$services.teams.createTeam(payload);
      context.commit('setTeam', await buildTeamSearchDataPayload(res, context));
      return context.state.team;
    } finally {
      context.commit('setSubmitLoading', false);
    }
  },

  async editTeam(this: Store<IState>, context: ActionContext<IState, IRootState>, payload: ITeam): Promise<ITeam> {
    context.commit('setSubmitLoading', true);
    try {
      const res = await this.$services.teams.editTeam(payload);
      context.commit('setTeam', await buildTeamSearchDataPayload(res, context));
      return context.state.team;
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
      const res = await this.$services.teams.searchTeams(params);
      context.commit('setCachedTeams', res.value);
      return res;
    } finally {
      context.commit('setSearchLoading', false);
    }
  },

  /**
   * Allows to search for teams with any search filter and returns the full information of the team and its members
   * Use case: Find all teams that are assigned to an event, with the filter:  { Events: { any: { Id: eventId } } }
   *
   * @param params  Search params
   * @returns An array of teams with aggregated data for the team members
   */
  async searchAggregatedTeams(this: Store<IState>, context: ActionContext<IState, IRootState>, params: IAzureSearchParams): Promise<ITeam[]> {
    const res = await this.$services.teams.searchTeams(params);

    if (res && res.value && res.value.length) {
      const teams = res.value;
      const aggregatedTeams = await Promise.all(
        teams.map(async (t) => {
          const team = await aggregateTeamSearchDataWithMembers(context, t);
          return new Team(team);
        }),
      );
      return aggregatedTeams;
    }
    return [];
  },

  async addTeamMembers(this: Store<IState>, context: ActionContext<IState, IState>, payload: { teamMembers: ITeamMemberData[] }): Promise<ITeam> {
    context.commit('setSubmitLoading', true);
    try {
      await this.$services.teams.addTeamMembers(context.state.team.id, payload.teamMembers);
      context.commit('addTeamMembers', payload.teamMembers);
      return context.state.team;
    } finally {
      context.commit('setSubmitLoading', false);
    }
  },

  async removeTeamMember(this: Store<IState>, context: ActionContext<IState, IState>, payload: { teamMemberId: uuid }): Promise<ITeam> {
    context.commit('setRemoveLoading', true);
    try {
      await this.$services.teams.removeTeamMember(context.state.team.id, payload.teamMemberId);
      context.commit('removeTeamMember', payload.teamMemberId);
      return context.state.team;
    } finally {
      context.commit('setRemoveLoading', false);
    }
  },
};

export const team: Module<IState, IRootState> = {
  namespaced: true,
  state: moduleState as IState,
  actions: (actions as unknown) as ActionTree<IState, IRootState>,
  mutations,
  getters,
};
