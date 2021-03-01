import { ITeam, ITeamData } from '@/entities/team';
import { IStore } from '@/store/store.types';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore): IStorage => ({
  getters: {
    loading(): boolean {
      return store.getters['team/loading'];
    },
  },

  mutations: {

  },

  actions: {
    createTeam(payload: ITeam): Promise<ITeam> {
      return store.dispatch('team/createTeam', payload);
    },

    searchTeams(params: IAzureSearchParams): Promise<IAzureSearchResult<ITeamData>> {
      return store.dispatch('team/searchTeams', params);
    },
  },
});
