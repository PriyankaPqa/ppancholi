import { ITeamData } from '@/entities/team';
import { IStore } from '@/store/store.types';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore): IStorage => ({
  actions: {
    searchTeams(params: IAzureSearchParams): Promise<IAzureSearchResult<ITeamData>> {
      return store.dispatch('team/searchTeams', params);
    },
  },
});
