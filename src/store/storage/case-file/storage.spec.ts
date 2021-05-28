import {
  CaseFile, ECaseFileTriage, ICaseFileLabel, mockCaseFilesSearchData, ECaseFileStatus,
} from '@/entities/case-file';
import { mockCaseNote } from '@/entities/case-file/case-note';
import { mockStore } from '@/store';
import { mockSearchParams } from '@/test/helpers';
import { IListOption } from '@/types';
import { makeStorage } from './storage';

const store = mockStore({}, { commit: true, dispatch: true });
const storage = makeStorage(store);

describe('>>> Case File Storage', () => {
  describe('>> Getters', () => {
    it('should proxy caseFileById', () => {
      expect(storage.getters.caseFileById('TEST_ID')).toEqual(store.getters['caseFile/caseFileById']('TEST_ID'));
    });

    it('should proxy caseNoteCategories', () => {
      expect(storage.getters.caseNoteCategories()).toEqual(store.getters['caseFile/caseNoteCategories']);
    });
  });

  describe('>> Actions', () => {
    it('should proxy fetchCaseFileActivities', () => {
      storage.actions.fetchCaseFileActivities('TEST_ID');
      expect(store.dispatch).toBeCalledWith('caseFile/fetchCaseFileActivities', 'TEST_ID');
    });

    it('should proxy fetchCaseFile', () => {
      storage.actions.fetchCaseFile('TEST_ID');
      expect(store.dispatch).toBeCalledWith('caseFile/fetchCaseFile', 'TEST_ID');
    });

    it('should proxy fetchInactiveReasons', () => {
      storage.actions.fetchInactiveReasons();
      expect(store.dispatch).toBeCalledWith('caseFile/fetchInactiveReasons');
    });

    it('should proxy fetchCloseReasons', () => {
      storage.actions.fetchCloseReasons();
      expect(store.dispatch).toBeCalledWith('caseFile/fetchCloseReasons');
    });

    it('should proxy fetchTagsOptions', () => {
      storage.actions.fetchTagsOptions();
      expect(store.dispatch).toBeCalledWith('caseFile/fetchTagsOptions');
    });

    it('should proxy searchCaseFiles', () => {
      const params = mockSearchParams;
      storage.actions.searchCaseFiles(params);
      expect(store.dispatch).toBeCalledWith('caseFile/searchCaseFiles', params);
    });

    it('should proxy setCaseFileTags', () => {
      const caseFile = new CaseFile(mockCaseFilesSearchData()[0]);
      const { id } = caseFile;
      const tags: IListOption[] = [{ optionItemId: 'foo', specifiedOther: null }];
      storage.actions.setCaseFileTags(id, tags);
      expect(store.dispatch).toBeCalledWith('caseFile/setCaseFileTags', { id, tags });
    });

    it('should proxy setCaseFileStatus', () => {
      const caseFile = new CaseFile(mockCaseFilesSearchData()[0]);
      const { id } = caseFile;
      const status: ECaseFileStatus = ECaseFileStatus.Inactive;
      const rationale = 'Some rationale';
      const reason: IListOption = { optionItemId: 'foo', specifiedOther: null };
      storage.actions.setCaseFileStatus(id, status, rationale, reason);
      expect(store.dispatch).toBeCalledWith('caseFile/setCaseFileStatus', {
        id,
        status,
        rationale,
        reason,
      });
    });

    it('should proxy setCaseFileLabels', () => {
      const caseFile = new CaseFile(mockCaseFilesSearchData()[0]);
      const { id } = caseFile;
      const labels: ICaseFileLabel[] = [
        {
          name: 'Label One',
          order: 1,
        },
        {
          name: 'Label Two',
          order: 2,
        },
      ];
      storage.actions.setCaseFileLabels(id, labels);
      expect(store.dispatch).toBeCalledWith('caseFile/setCaseFileLabels', { id, labels });
    });

    it('should proxy setCaseFileIsDuplicate', () => {
      const caseFile = new CaseFile(mockCaseFilesSearchData()[0]);
      const { id } = caseFile;
      const isDuplicate = true;
      storage.actions.setCaseFileIsDuplicate(id, isDuplicate);
      expect(store.dispatch).toBeCalledWith('caseFile/setCaseFileIsDuplicate', { id, isDuplicate });
    });

    it('should proxy fetchActiveCaseNoteCategories', () => {
      storage.actions.fetchActiveCaseNoteCategories();
      expect(store.dispatch).toBeCalledWith('caseFile/fetchActiveCaseNoteCategories');
    });

    it('should proxy setCaseFileTriage', () => {
      const caseFile = new CaseFile(mockCaseFilesSearchData()[0]);
      const { id } = caseFile;
      const triage = ECaseFileTriage.Tier1;
      storage.actions.setCaseFileTriage(id, triage);
      expect(store.dispatch).toBeCalledWith('caseFile/setCaseFileTriage', { id, triage });
    });

    it('should proxy addCaseNote', () => {
      const caseNote = mockCaseNote();
      const id = 'id';
      storage.actions.addCaseNote(id, caseNote);
      expect(store.dispatch).toBeCalledWith('caseFile/addCaseNote', { id, caseNote });
    });

    it('should proxy searchCaseNotes', () => {
      const params = mockSearchParams;
      storage.actions.searchCaseNotes(params);
      expect(store.dispatch).toBeCalledWith('caseFile/searchCaseNotes', params);
    });
  });
});
