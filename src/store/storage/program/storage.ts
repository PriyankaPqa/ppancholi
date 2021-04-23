import { IProgram } from '@/entities/program';
import { IStore, IState } from '@/store/store.types';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore<IState>): IStorage => ({
  actions: {
    createProgram(program: IProgram): Promise<IProgram> {
      return store.dispatch('program/createProgram', program);
    },

    searchPrograms(params: IAzureSearchParams): Promise<IAzureSearchResult<IProgram>> {
      return store.dispatch('program/searchPrograms', params);
    },
  },
});
