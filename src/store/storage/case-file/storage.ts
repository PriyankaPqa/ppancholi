import { ICaseFile } from '@/entities/case-file';
import { IStore } from '@/store/store.types';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore): IStorage => ({
  getters: {
  },

  actions: {
    searchCaseFiles(params: IAzureSearchParams): Promise<IAzureSearchResult<ICaseFile>> {
      return store.dispatch('caseFile/searchCaseFiles', params);
    },
  },
});
