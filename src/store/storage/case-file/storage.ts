import { ICaseFile } from '@/entities/case-file';
import { IStore } from '@/store/store.types';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore): IStorage => ({
  getters: {
    caseFileById(id: uuid): ICaseFile {
      return store.getters['caseFile/caseFileById'](id);
    },
  },

  actions: {
    searchCaseFiles(params: IAzureSearchParams): Promise<IAzureSearchResult<ICaseFile>> {
      return store.dispatch('caseFile/searchCaseFiles', params);
    },

    fetchCaseFile(id: uuid): Promise<ICaseFile> {
      return store.dispatch('caseFile/fetchCaseFile', id);
    },
  },
});
