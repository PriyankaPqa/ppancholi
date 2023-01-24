import { mockCaseNotesService } from '@libs/services-lib/case-notes/entity';
import { mockOptionItemsServiceService } from '@libs/services-lib/optionItems';
import { getBaseStoreComponents } from '@libs/stores-lib/base';
import { EOptionLists, mockOptionItemData, OptionItem } from '@libs/entities-lib/optionItem';
import { createTestingPinia } from '@pinia/testing';
import { defineStore, setActivePinia } from 'pinia';
import _sortBy from 'lodash/sortBy';
import { ICaseNoteEntity, mockCaseNoteEntity, IdParams } from '@libs/entities-lib/case-note';
import { getExtensionComponents } from '@/pinia/case-note/case-note-extension';

const entityService = mockCaseNotesService();
const optionsService = mockOptionItemsServiceService();
const baseComponents = getBaseStoreComponents<ICaseNoteEntity, IdParams>(entityService);

const getPinia = () => {
  const pinia = createTestingPinia({
    initialState: {
      'test-case-note': {
        caseNoteCategories: mockOptionItemData(),
        isSavingCaseNote: false,
        caseNoteCategoriesFetched: false,
      },
    },
    stubActions: false,
  });
  setActivePinia(pinia);
  return pinia;
};

const useCaseNoteTestStore = (opts = {}) => {
  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService, optionsService);

  const useCaseNoteStore = defineStore('test-case-note', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));
  return useCaseNoteStore();
};

const createTestStore = (bComponents = {}) => {
  getPinia();
  return useCaseNoteTestStore(bComponents);
};

describe('>>> Case Note Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCaseNoteCategories', () => {
    test('the getter calls filterAndSortActiveItems with the right params and returns the result', () => {
      const store = createTestStore();
      const res = store.getCaseNoteCategories(false);
      optionsService.getOptionList = jest.fn(() => res);
      expect(res).toEqual(
        _sortBy(
          mockOptionItemData().map((e) => new OptionItem(e)),
          'orderRank',
        ),
      );
    });
  });

  describe('setCaseNoteCategories', () => {
    it('sets the caseNote Categories array', () => {
      const store = createTestStore();
      const entity = mockOptionItemData();
      store.setCaseNoteCategories(entity);
      expect(store.caseNoteCategories)
        .toEqual(entity);
    });
  });

  describe('setCaseNoteCategoriesFetched', () => {
    it('should sets the caseNoteCategoriesFetched state', () => {
      const store = createTestStore();
      store.setCaseNoteCategoriesFetched(true);
      expect(store.caseNoteCategoriesFetched)
        .toBeTruthy();
      store.setCaseNoteCategoriesFetched(false);
      expect(store.caseNoteCategoriesFetched)
        .toBeFalsy();
    });
  });

  describe('setIsSavingCaseNote', () => {
    it('should sets the isSavingCaseNote state', () => {
      const store = createTestStore();
      store.setIsSavingCaseNote(true);
      expect(store.isSavingCaseNote)
        .toBeTruthy();
      store.setIsSavingCaseNote(false);
      expect(store.isSavingCaseNote)
        .toBeFalsy();
    });
  });

  describe('fetchCaseNoteCategories', () => {
    it('should call optionItemService getOptionList and commit the result', async () => {
      const store = createTestStore();
      const res = mockOptionItemData();
      optionsService.getOptionList = jest.fn(() => res);
      await store.fetchCaseNoteCategories();

      expect(optionsService.getOptionList).toBeCalledWith(EOptionLists.CaseNoteCategories);
      expect(store.caseNoteCategories).toEqual(res);
      expect(store.caseNoteCategoriesFetched).toEqual(true);
    });
  });

  describe('addCaseNote', () => {
    it('should call addCaseNote service with proper params', async () => {
      const bComponents = { ...baseComponents, addNewlyCreatedId: jest.fn(), set: jest.fn() };
      const store = createTestStore(bComponents);
      const caseNote = mockCaseNoteEntity();
      const payload = { id: '1', caseNote };
      const res = {} as ICaseNoteEntity;
      entityService.addCaseNote = jest.fn(() => res);
      await store.addCaseNote(payload);

      expect(entityService.addCaseNote).toBeCalledWith('1', caseNote);
      expect(bComponents.addNewlyCreatedId).toBeCalledWith(res);
      expect(bComponents.set).toBeCalledWith(res);
    });
  });

  describe('pinCaseNote', () => {
    it('should call pinCaseNote service with proper params', async () => {
      const bComponents = { ...baseComponents, set: jest.fn() };
      const store = createTestStore(bComponents);
      const payload = { caseFileId: 'cf-1', caseNoteId: 'cn-1', isPinned: true };
      const res = {} as ICaseNoteEntity;
      entityService.pinCaseNote = jest.fn(() => res);
      await store.pinCaseNote(payload);

      expect(entityService.pinCaseNote).toBeCalledWith('cf-1', 'cn-1', true);
      expect(bComponents.set).toBeCalledWith(res);
    });
  });

  describe('editCaseNote', () => {
    it('should call editCaseNote service with proper params', async () => {
      const bComponents = { ...baseComponents, set: jest.fn() };
      const store = createTestStore(bComponents);
      const caseNote = mockCaseNoteEntity();
      const payload = { caseFileId: 'cf-1', caseNoteId: 'cn-1', caseNote };
      const res = {} as ICaseNoteEntity;
      entityService.editCaseNote = jest.fn(() => res);
      await store.editCaseNote(payload);

      expect(entityService.editCaseNote).toBeCalledWith('cf-1', 'cn-1', caseNote);
      expect(bComponents.set).toBeCalledWith(res);
    });
  });
});
