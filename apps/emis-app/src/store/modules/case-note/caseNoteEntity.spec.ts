import { ActionContext } from 'vuex';
import _sortBy from 'lodash/sortBy';

import { httpClient } from '@/services/httpClient';
import { CaseNotesService } from '@libs/services-lib/case-notes/entity';
import { OptionItemsService } from '@libs/services-lib/optionItems';

import { EOptionLists, mockOptionItemData, OptionItem } from '@libs/entities-lib/optionItem';
import { mockCaseNoteCategories, mockCaseNoteEntity } from '@libs/entities-lib/case-note';
import { mockSignalR } from '@libs/shared-lib/signal-r';
import { CaseNoteEntityModule } from './caseNoteEntity';
import { ICaseNoteEntityState } from './caseNoteEntity.types';

const signalR = mockSignalR();
const service = new CaseNotesService(httpClient);
const optionItemService = new OptionItemsService(httpClient);
const myModule = new CaseNoteEntityModule(service, optionItemService, signalR);

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
        myModule.mutations.setCaseNoteCategories(myModule.state, mockCaseNoteCategories());
        const res = myModule.getters.caseNoteCategories(myModule.state)(true);
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
        myModule.mutations.setCaseNoteCategories(myModule.state, categories);
        expect(myModule.state.caseNoteCategories).toEqual(categories);
      });
    });

    describe('setCaseNoteCategoriesFetched', () => {
      test('the setCaseNoteCategoriesFetched mutation sets the caseNoteCategoriesFetched state', () => {
        myModule.mutations.setCaseNoteCategoriesFetched(myModule.state, true);
        expect(myModule.state.caseNoteCategoriesFetched).toEqual(true);
      });
    });

    describe('setIsSavingCaseNote', () => {
      test('the setIsSavingCaseNote mutation sets the isSavingCaseNote state', () => {
        expect(myModule.state.isSavingCaseNote).toBe(false);
        myModule.mutations.setIsSavingCaseNote(myModule.state, true);
        expect(myModule.state.isSavingCaseNote).toBe(true);
      });
    });
  });

  describe('actions', () => {
    describe('fetchCaseNoteCategories', () => {
      it('should call optionItemService getOptionList and commit the result', async () => {
        const res = mockOptionItemData();
        myModule.optionItemService.getOptionList = jest.fn(() => Promise.resolve(res));
        await myModule.actions.fetchCaseNoteCategories(actionContext);

        expect(myModule.optionItemService.getOptionList).toBeCalledWith(EOptionLists.CaseNoteCategories);
        expect(actionContext.commit).toBeCalledWith('setCaseNoteCategories', res);
      });
    });

    describe('addCaseNote', () => {
      it('calls the right service and returns the result', async () => {
        const serviceRes = mockCaseNoteEntity();
        const id = 'mock-id';
        const caseNote = mockCaseNoteEntity();
        myModule.service.addCaseNote = jest.fn(() => Promise.resolve(serviceRes));
        const res = await myModule.actions.addCaseNote(actionContext, { id, caseNote });

        expect(myModule.service.addCaseNote).toBeCalledWith(id, caseNote);
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
        myModule.service.pinCaseNote = jest.fn(() => Promise.resolve(serviceRes));
        const res = await myModule.actions.pinCaseNote(actionContext, { caseFileId, caseNoteId, isPinned });

        expect(myModule.service.pinCaseNote).toBeCalledWith(caseFileId, caseNoteId, isPinned);
        expect(res).toEqual(serviceRes);
      });
    });

    describe('editCaseNote', () => {
      it('calls the right service and returns the result', async () => {
        const serviceRes = mockCaseNoteEntity();
        const caseFileId = 'mock-case-file-id';
        const caseNoteId = 'mock-case-note-id';
        const caseNote = mockCaseNoteEntity();

        myModule.service.editCaseNote = jest.fn(() => Promise.resolve(serviceRes));
        const res = await myModule.actions.editCaseNote(actionContext, { caseFileId, caseNoteId, caseNote });

        expect(myModule.service.editCaseNote).toBeCalledWith(caseFileId, caseNoteId, caseNote);
        expect(res).toEqual(serviceRes);
      });
    });
  });
});
