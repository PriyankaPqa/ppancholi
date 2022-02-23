/**
 * @group storage
 */

/* eslint-disable */
import { CASE_DOCUMENT_METADATA, CASE_DOCUMENT_ENTITIES } from '@/constants/vuex-modules';
import { mockStore } from '@/store';
import { mockSearchParams } from '@/test/helpers';
import { CaseFileDocumentStorage } from './storage';
import { mockOptionItemData } from '@/entities/optionItem';
import { mockCaseFileDocumentEntity } from '@/entities/case-file-document';
import { mockCaseFileDocumentMetadata } from './../../../entities/case-file-document/case-file-document.mock';

const entityModuleName = CASE_DOCUMENT_ENTITIES;
const metadataModuleName = CASE_DOCUMENT_METADATA;

const documentEntity1 =  mockCaseFileDocumentEntity({id: '1', caseFileId: 'case-file-1'});
const documentEntity2 =  mockCaseFileDocumentEntity({id: '2', caseFileId: 'case-file-2'});
const documentMetadata1 =  mockCaseFileDocumentMetadata({id: '1'});
const documentMetadata2 =  mockCaseFileDocumentMetadata({id: '2'});

const store = mockStore({
  modules: {
    [entityModuleName]: {
      state: {
        categories: mockOptionItemData(),
        items: [documentEntity1, documentEntity2]
      },
    },
    [metadataModuleName]: {
      state: {
        items: [documentMetadata1, documentMetadata2]
      },
    },
  },
}, { commit: true, dispatch: true });

const storage = new CaseFileDocumentStorage(store, entityModuleName, metadataModuleName).make();

describe('>>> Case File Document Storage', () => {
  describe('>> Getters', () => {
    describe('categories', () => {
      it('should proxy categories', () => {
        const storageGetter = storage.getters.categories();
        const storeGetter = store.getters[`${entityModuleName}/categories`]();
        expect(storageGetter).toEqual(storeGetter);
      });
    });



    describe('getByCaseFile', () => {
      it('should return all documents of a case file, with entity and metadata', () => {
        const expected = storage.getters.getByCaseFile('case-file-1');
        expect(expected).toEqual([{entity: documentEntity1, metadata: documentMetadata1, pinned: false}]);
      });
    });
  });

  describe('>> Actions', () => {
    it('should proxy fetchCategories', () => {
      storage.actions.fetchCategories();
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/fetchCategories`);
    });
    it('should proxy updateDocument', () => {
      storage.actions.updateDocument({ mydoc: 'mm' } as any);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/updateDocument`, { mydoc: 'mm' });
    });

    it('should proxy downloadDocumentAsUrl', () => {
      storage.actions.downloadDocumentAsUrl({ mydoc: 'mm' } as any, true);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/downloadDocumentAsUrl`, { item: { mydoc: 'mm' }, saveDownloadedFile: true });
    });
  });

  describe('>> Mutations', () => {
    it('should proxy setCategoriesFetched', () => {
      const payload = true;
      storage.mutations.setCategoriesFetched(payload);
      expect(store.commit).toBeCalledWith(`${entityModuleName}/setCategoriesFetched`, payload);
    });
  });
});
