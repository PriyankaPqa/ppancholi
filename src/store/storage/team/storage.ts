import { ITeam, ITeamSearchData } from '@/entities/team';
import { IStore } from '@/store/store.types';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { IAppUserData } from '@/entities/app-user';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore): IStorage => ({
  actions: {
    getTeam(id: uuid): Promise<ITeam> {
      return store.dispatch('team/getTeam', id);
    },

    createTeam(payload: ITeam): Promise<ITeam> {
      return store.dispatch('team/createTeam', payload);
    },

    editTeam(payload: ITeam): Promise<ITeam> {
      return store.dispatch('team/editTeam', payload);
    },

    searchTeams(params: IAzureSearchParams): Promise<IAzureSearchResult<ITeamSearchData>> {
      return store.dispatch('team/searchTeams', params);
    },

    addTeamMembers(teamId: uuid, teamMembers: IAppUserData[]): Promise<ITeam> {
      return store.dispatch('team/addTeamMembers', { teamId, teamMembers });
    },
  },
});
