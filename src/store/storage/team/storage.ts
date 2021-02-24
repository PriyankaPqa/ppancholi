import { ITeam } from '@/entities/team';
import { IStore } from '@/store/store.types';
import { ISearchData } from '@/types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore): IStorage => ({
  getters: {

  },

  mutations: {

  },

  actions: {
    searchTeams(params: ISearchData): Promise<ITeam[]> {
      return store.dispatch('team/searchTeams', params);
    },
  },
});
