import { mockCaseNoteCategories, mockCaseNoteEntity } from '@libs/entities-lib/case-note';
import { CASE_NOTE_ENTITIES, CASE_NOTE_METADATA } from '@/constants/vuex-modules';
import { mockStore } from '@/store';
import { ISearchData } from '@libs/core-lib/types';
import { CaseNoteStorage } from './storage';

const entityModuleName = CASE_NOTE_ENTITIES;
const metadataModuleName = CASE_NOTE_METADATA;

export const mockSearchParams: ISearchData = {
  filter: 'foo',
};

const store = mockStore({
  modules: {
    [entityModuleName]: {
      state: {
        caseNoteCategories: mockCaseNoteCategories(),
        isSavingCaseNote: false,
        isLoadingCaseNotes: false,
      },
    },
  },
}, { commit: true, dispatch: true });

const storage = new CaseNoteStorage(store, entityModuleName, metadataModuleName).make();

describe('>>> Case File Storage', () => {
  describe('>> Getters', () => {
    describe('caseNoteCategories', () => {
      it('should proxy caseNoteCategories', () => {
        const storageGetter = storage.getters.caseNoteCategories();
        const storeGetter = store.getters[`${entityModuleName}/caseNoteCategories`]();
        expect(storageGetter).toEqual(storeGetter);
      });
    });
  });

  describe('>> Actions', () => {
    it('should proxy fetchCaseNoteCategories', () => {
      storage.actions.fetchCaseNoteCategories();
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/fetchCaseNoteCategories`);
    });

    it('should proxy addCaseNote', () => {
      const caseNote = mockCaseNoteEntity();
      const id = 'id';
      storage.actions.addCaseNote(id, caseNote);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/addCaseNote`, { id, caseNote });
    });

    it('should proxy pinCaseNote', () => {
      const caseFileId = 'case file id';
      const caseNoteId = 'case note id';
      const isPinned = true;
      storage.actions.pinCaseNote(caseFileId, caseNoteId, isPinned);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/pinCaseNote`, { caseFileId, caseNoteId, isPinned });
    });

    it('should proxy editCaseNote', () => {
      const caseNote = mockCaseNoteEntity();
      const caseFileId = 'case file id';
      const caseNoteId = 'case note id';
      storage.actions.editCaseNote(caseFileId, caseNoteId, caseNote);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/editCaseNote`, { caseFileId, caseNoteId, caseNote });
    });

    it('should proxy searchCaseNotes', () => {
      const params = mockSearchParams;
      const searchEndpoint = 'mock-case-note-search-endpoint';
      storage.actions.searchCaseNotes(params, searchEndpoint);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/search`, { params, searchEndpoint });
    });
  });

  describe('>> Mutations', () => {
    it('should proxy setCaseNoteCategoriesFetched', () => {
      const payload = true;
      storage.mutations.setCaseNoteCategoriesFetched(payload);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setCaseNoteCategoriesFetched`, payload);
    });
  });
});
