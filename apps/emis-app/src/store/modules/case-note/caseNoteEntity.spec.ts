import { ActionContext } from 'vuex';
import _sortBy from 'lodash/sortBy';

import { httpClient } from '@/services/httpClient';
import { CaseNotesService } from '@/services/case-notes/entity';
import { OptionItemsService } from '@/services/optionItems';

import { EOptionLists, mockOptionItemData, OptionItem } from '@/entities/optionItem';
import { mockCaseNoteCategories, mockCaseNoteEntity } from '@/entities/case-note';
import { CaseNoteEntityModule } from './caseNoteEntity';
import { ICaseNoteEntityState } from './caseNoteEntity.types';

const service = new CaseNotesService(httpClient);
const optionItemService = new OptionItemsService(httpClient);
const module = new CaseNoteEntityModule(service, optionItemService);

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: {} as ICaseNoteEntityState,
  getters: {},
  rootState: null,
  rootGetters: {},
} as ActionContext<ICaseNoteEntityState, ICaseNoteEntityState>;

describe('Case file entity module', () => {
  describe('getters', () => {
    describe('caseNoteCategories', () => {
      test('the getter returns the sorted case note categories', () => {
        module.mutations.setCaseNoteCategories(module.state, mockCaseNoteCategories());
        const res = module.getters.caseNoteCategories(module.state);
        expect(res).toEqual(
          _sortBy(
            mockCaseNoteCategories().map((e) => new OptionItem(e)),
            'orderRank',
          ),
        );
      });
    });
  });

  describe('mutations', () => {
    describe('setCaseNoteCategories', () => {
      test('the setCaseNoteCategories mutation sets the caseNoteCategories state', () => {
        const categories = mockOptionItemData();
        module.mutations.setCaseNoteCategories(module.state, categories);
        expect(module.state.caseNoteCategories).toEqual(categories);
      });
    });

    describe('setCaseNoteCategoriesFetched', () => {
      test('the setCaseNoteCategoriesFetched mutation sets the caseNoteCategoriesFetched state', () => {
        module.mutations.setCaseNoteCategoriesFetched(module.state, true);
        expect(module.state.caseNoteCategoriesFetched).toEqual(true);
      });
    });

    describe('setIsSavingCaseNote', () => {
      test('the setIsSavingCaseNote mutation sets the isSavingCaseNote state', () => {
        expect(module.state.isSavingCaseNote).toBe(false);
        module.mutations.setIsSavingCaseNote(module.state, true);
        expect(module.state.isSavingCaseNote).toBe(true);
      });
    });

    describe('setIsLoadingCaseNotes', () => {
      test('the setIsLoadingCaseNotes mutation sets the isLoadingCaseNotes state', () => {
        expect(module.state.isLoadingCaseNotes).toBe(false);
        module.mutations.setIsLoadingCaseNotes(module.state, true);
        expect(module.state.isLoadingCaseNotes).toBe(true);
      });
    });
  });

  describe('actions', () => {
    describe('fetchCaseNoteCategories', () => {
      it('should call optionItemService getOptionList and commit the result', async () => {
        const res = mockOptionItemData();
        module.optionItemService.getOptionList = jest.fn(() => Promise.resolve(res));
        await module.actions.fetchCaseNoteCategories(actionContext);

        expect(module.optionItemService.getOptionList).toBeCalledWith(EOptionLists.CaseNoteCategories);
        expect(actionContext.commit).toBeCalledWith('setCaseNoteCategories', res);
      });
    });

    describe('addCaseNote', () => {
      it('calls the right service and returns the result', async () => {
        const serviceRes = mockCaseNoteEntity();
        const id = 'mock-id';
        const caseNote = mockCaseNoteEntity();
        module.service.addCaseNote = jest.fn(() => Promise.resolve(serviceRes));
        const res = await module.actions.addCaseNote(actionContext, { id, caseNote });

        expect(module.service.addCaseNote).toBeCalledWith(id, caseNote);
        expect(res).toEqual(serviceRes);
        expect(actionContext.commit).toBeCalledWith('addNewlyCreatedId', res);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('pinCaseNote', () => {
      it('calls the right service and returns the result', async () => {
        const serviceRes = mockCaseNoteEntity();
        const caseFileId = 'mock-case-file-id';
        const caseNoteId = 'mock-case-note-id';
        const isPinned = true;
        module.service.pinCaseNote = jest.fn(() => Promise.resolve(serviceRes));
        const res = await module.actions.pinCaseNote(actionContext, { caseFileId, caseNoteId, isPinned });

        expect(module.service.pinCaseNote).toBeCalledWith(caseFileId, caseNoteId, isPinned);
        expect(res).toEqual(serviceRes);
      });
    });

    describe('editCaseNote', () => {
      it('calls the right service and returns the result', async () => {
        const serviceRes = mockCaseNoteEntity();
        const caseFileId = 'mock-case-file-id';
        const caseNoteId = 'mock-case-note-id';
        const caseNote = mockCaseNoteEntity();

        module.service.editCaseNote = jest.fn(() => Promise.resolve(serviceRes));
        const res = await module.actions.editCaseNote(actionContext, { caseFileId, caseNoteId, caseNote });

        expect(module.service.editCaseNote).toBeCalledWith(caseFileId, caseNoteId, caseNote);
        expect(res).toEqual(serviceRes);
      });
    });
  });
});
