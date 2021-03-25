import { ITeam, ITeamSearchData, Team } from '@/entities/team';
import { IStore } from '@/store/store.types';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { IAppUserData } from '@/entities/app-user';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore): IStorage => ({
  getters: {
    team() {
      return store.getters['team/team'];
    },
  },

  mutations: {
    resetTeam() {
      return store.commit('team/resetTeam');
    },
  },

  actions: {
    getTeam(id: uuid): Promise<ITeam> {
      return store.dispatch('team/getTeam', id);
    },

    createTeam(payload: Team): Promise<ITeam> {
      return store.dispatch('team/createTeam', payload);
    },

    editTeam(payload: ITeam): Promise<ITeam> {
      return store.dispatch('team/editTeam', payload);
    },

    searchTeams(params: IAzureSearchParams): Promise<IAzureSearchResult<ITeamSearchData>> {
      return store.dispatch('team/searchTeams', params);
    },

    addTeamMembers(teamMembers: IAppUserData[]): Promise<ITeam> {
      return store.dispatch('team/addTeamMembers', { teamMembers });
    },

    removeTeamMember(teamMemberId: uuid): Promise<ITeam> {
      return store.dispatch('team/removeTeamMember', { teamMemberId });
    },
  },
});
