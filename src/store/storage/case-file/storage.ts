import { ICaseFile, ICaseFileLabel } from '@/entities/case-file';
import { IOptionItem } from '@/entities/optionItem';
import { IStore, IState } from '@/store/store.types';
import { IAzureSearchParams, IAzureSearchResult, IListOption } from '@/types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore<IState>): IStorage => ({
  getters: {
    caseFileById(id: uuid): ICaseFile {
      return store.getters['caseFile/caseFileById'](id);
    },

    tagsOptions(): Array<IOptionItem> {
      return store.getters['caseFile/tagsOptions'];
    },
  },

  actions: {
    fetchTagsOptions(): Promise<IOptionItem[]> {
      return store.dispatch('caseFile/fetchTagsOptions');
    },

    fetchCaseFile(id: uuid): Promise<ICaseFile> {
      return store.dispatch('caseFile/fetchCaseFile', id);
    },

    searchCaseFiles(params: IAzureSearchParams): Promise<IAzureSearchResult<ICaseFile>> {
      return store.dispatch('caseFile/searchCaseFiles', params);
    },

    setCaseFileTags(id: uuid, tags: IListOption[]): Promise<ICaseFile> {
      return store.dispatch('caseFile/setCaseFileTags', { id, tags });
    },

    setCaseFileLabels(id: uuid, labels: ICaseFileLabel[]): Promise<ICaseFile> {
      return store.dispatch('caseFile/setCaseFileLabels', { id, labels });
    },

    setCaseFileIsDuplicate(id: uuid, isDuplicate: boolean): Promise<ICaseFile> {
      return store.dispatch('caseFile/setCaseFileIsDuplicate', { id, isDuplicate });
    },
  },
});
