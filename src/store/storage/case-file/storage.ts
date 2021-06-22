import {
  ICaseFile, ICaseFileActivity, ICaseFileLabel, ECaseFileTriage, ECaseFileStatus,
} from '@/entities/case-file';
import { ICaseNote } from '@/entities/case-file/case-note';
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

    caseNoteCategories(): Array<IOptionItem> {
      return store.getters['caseFile/caseNoteCategories'];
    },

    inactiveReasons(): Array<IOptionItem> {
      return store.getters['caseFile/inactiveReasons'];
    },

    closeReasons(): Array<IOptionItem> {
      return store.getters['caseFile/closeReasons'];
    },
  },

  actions: {
    fetchTagsOptions(): Promise<IOptionItem[]> {
      return store.dispatch('caseFile/fetchTagsOptions');
    },

    fetchInactiveReasons(): Promise<IOptionItem[]> {
      return store.dispatch('caseFile/fetchInactiveReasons');
    },

    fetchCloseReasons(): Promise<IOptionItem[]> {
      return store.dispatch('caseFile/fetchCloseReasons');
    },

    fetchCaseFileActivities(id: uuid): Promise<ICaseFileActivity[]> {
      return store.dispatch('caseFile/fetchCaseFileActivities', id);
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

    setCaseFileStatus(id: uuid, status: ECaseFileStatus, rationale?: string, reason?: IListOption): Promise<ICaseFile> {
      return store.dispatch('caseFile/setCaseFileStatus', {
        id,
        status,
        rationale,
        reason,
      });
    },

    setCaseFileLabels(id: uuid, labels: ICaseFileLabel[]): Promise<ICaseFile> {
      return store.dispatch('caseFile/setCaseFileLabels', { id, labels });
    },

    setCaseFileIsDuplicate(id: uuid, isDuplicate: boolean): Promise<ICaseFile> {
      return store.dispatch('caseFile/setCaseFileIsDuplicate', { id, isDuplicate });
    },

    fetchActiveCaseNoteCategories(): Promise<IOptionItem[]> {
      return store.dispatch('caseFile/fetchActiveCaseNoteCategories');
    },

    addCaseNote(id: uuid, caseNote: ICaseNote): Promise<ICaseNote> {
      return store.dispatch('caseFile/addCaseNote', { id, caseNote });
    },

    pinCaseNote(caseFileId: uuid, caseNoteId: uuid, isPinned: boolean): Promise<ICaseNote> {
      return store.dispatch('caseFile/pinCaseNote', { caseFileId, caseNoteId, isPinned });
    },

    editCaseNote(caseFileId: uuid, caseNoteId: uuid, caseNote: ICaseNote): Promise<ICaseNote> {
      return store.dispatch('caseFile/editCaseNote', { caseFileId, caseNoteId, caseNote });
    },

    searchCaseNotes(params: IAzureSearchParams): Promise<IAzureSearchResult<ICaseNote>> {
      return store.dispatch('caseFile/searchCaseNotes', params);
    },

    setCaseFileTriage(id: uuid, triage: ECaseFileTriage): Promise<ICaseFile> {
      return store.dispatch('caseFile/setCaseFileTriage', { id, triage });
    },

    setCaseFileAssign(id: uuid, individuals: uuid[], teams: uuid[]): Promise<ICaseFile> {
      return store.dispatch('caseFile/setCaseFileAssign', { id, individuals, teams });
    },
  },
});
