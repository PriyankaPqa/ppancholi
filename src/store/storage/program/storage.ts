import { IProgram } from '@/entities/program';
import { IStore, IState } from '@/store/store.types';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore<IState>): IStorage => ({
  getters: {
    getProgramById(id: uuid): IProgram {
      return store.getters['program/getProgramById'](id);
    },
  },

  actions: {
    createProgram(program: IProgram): Promise<IProgram> {
      return store.dispatch('program/createProgram', program);
    },

    updateProgram(program: IProgram): Promise<IProgram> {
      return store.dispatch('program/updateProgram', program);
    },

    searchPrograms(params: IAzureSearchParams): Promise<IAzureSearchResult<IProgram>> {
      return store.dispatch('program/searchPrograms', params);
    },

    fetchProgram(id: uuid): Promise<IProgram> {
      return store.dispatch('program/fetchProgram', id);
    },
  },
});
