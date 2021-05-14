import { CaseFile, ICaseFileLabel, mockCaseFilesSearchData } from '@/entities/case-file';
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

    it('should proxy setCaseFileLabels', () => {
      const caseFile = new CaseFile(mockCaseFilesSearchData()[0]);
      const { id } = caseFile;
      const labels: ICaseFileLabel[] = [{
        name: 'Label One',
        order: 1,
      }, {
        name: 'Label Two',
        order: 2,
      }];
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
  });
});
