import { mockCaseFileDocumentsService } from '@libs/services-lib/case-file-documents/entity';
import { getBaseStoreComponents } from '@/pinia/base';
import { ICaseFileDocumentEntity, mockCaseFileDocumentEntity } from '@libs/entities-lib/case-file-document';
import { mockSignalR } from '@/ui/plugins/signal-r';
import { getExtensionComponents } from '@/pinia/case-file-document/case-file-document-extension';
import { createTestingPinia } from '@pinia/testing';
import { mockOptionItemsServiceService } from '@libs/services-lib/optionItems';
import { defineStore } from 'pinia';
import { EOptionLists, mockOptionItemData, OptionItem } from '@libs/entities-lib/optionItem';
import _sortBy from 'lodash/sortBy';
import { Status } from '@libs/entities-lib/base';

const entityService = mockCaseFileDocumentsService();
const baseComponents = getBaseStoreComponents<ICaseFileDocumentEntity, { id: uuid, caseFileId: uuid }>(entityService, mockSignalR());
const optionService = mockOptionItemsServiceService();

const createTestStore = (opts = {}) => {
  const pinia = createTestingPinia({
    initialState: {
      'test-case-file-document': {
        categories: mockOptionItemData(),
      },
    },
    stubActions: false,
  });

  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService, optionService);

  const useCasefileDocumentStore = defineStore('test-case-file-document', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));

  return useCasefileDocumentStore(pinia);
};

describe('Case file document store', () => {
  describe('getCategories', () => {
    it(' should return the sorted types', () => {
      const store = createTestStore();
      const res = store.getCategories(false);
      expect(res).toEqual(
        _sortBy(
          mockOptionItemData().map((e) => new OptionItem(e)),
          'orderRank',
        ),
      );
    });
  });

  describe('getByCaseFile', () => {
    it('should return the documents that have the id passed in the argument', () => {
      const document1 = mockCaseFileDocumentEntity({ id: '1', caseFileId: 'case-file-1' });
      const document2 = mockCaseFileDocumentEntity({ id: '2', caseFileId: 'case-file-2' });
      const store = createTestStore();
      store.items = [];
      store.setAll([document1, document2]);
      const res = store.getByCaseFile('case-file-1');
      expect(res).toEqual([document1]);
    });

    it('should ignore inactive documents', () => {
      const item1 = mockCaseFileDocumentEntity({ id: '1', caseFileId: 'case-file-1', status: Status.Inactive });
      const item2 = mockCaseFileDocumentEntity({ id: '2', caseFileId: 'case-file-1', status: Status.Active });
      const store = createTestStore();
      store.items = [];
      store.setAll([item1, item2]);
      const res = store.getByCaseFile('case-file-1');
      expect(res).toEqual([item2]);
    });
  });

  describe('fetchCategories', () => {
    it('should call optionItemService getOptionList and commit the result', async () => {
      const res = mockOptionItemData();
      const store = createTestStore();
      optionService.getOptionList = jest.fn(() => res);
      await store.fetchCategories();

      expect(optionService.getOptionList).toBeCalledWith(EOptionLists.DocumentCategories);
      expect(store.categories).toEqual(res);
      expect(store.categoriesFetched).toEqual(true);
    });
  });
  describe('updateDocument', () => {
    it('should call service updateDocument and commit the result', async () => {
      const store = createTestStore();
      const mockDocument = { name: 'name2' } as ICaseFileDocumentEntity;
      entityService.updateDocument = jest.fn(() => mockDocument);
      await store.updateDocument({ name: 'name' } as ICaseFileDocumentEntity);

      expect(entityService.updateDocument).toBeCalledWith({ name: 'name' });
      expect(store.items).toContainEqual({ name: 'name2' });
    });
  });

  describe('downloadDocumentAsUrl', () => {
    it('should call service downloadDocumentAsUrl', async () => {
      const store = createTestStore();
      await store.downloadDocumentAsUrl({ item: { name: 'name' } as ICaseFileDocumentEntity, saveDownloadedFile: true });

      expect(entityService.downloadDocumentAsUrl).toBeCalledWith({ name: 'name' }, true);
    });
  });
});
