/* eslint-disable */
import { ActionContext } from 'vuex';
import _sortBy from 'lodash/sortBy';

import { httpClient } from '@/services/httpClient';
import { CaseFileDocumentsService } from '@/services/case-file-documents/entity';
import { OptionItemsService } from '@/services/optionItems';

import { EOptionLists, mockOptionItemData, OptionItem } from '@/entities/optionItem';
import { mockCaseFileDocumentEntity, mockCaseFileDocumentEntities, ICaseFileDocumentEntity } from '@/entities/case-file-document';
import { CaseFileDocumentEntityModule } from './caseFileDocumentEntity';
import { ICaseFileDocumentEntityState } from './caseFileDocumentEntity.types';
import { Status } from '@/entities/base';

const service = new CaseFileDocumentsService(httpClient);
const optionItemService = new OptionItemsService(httpClient);
let module: CaseFileDocumentEntityModule;

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: {} as ICaseFileDocumentEntityState,
  getters: { categories: jest.fn(), categoriesFetched: jest.fn() },
  rootState: null,
  rootGetters: {},
} as ActionContext<ICaseFileDocumentEntityState, ICaseFileDocumentEntityState>;

describe('Case file document entity module', () => {
  
  beforeEach(() => {
    module = new CaseFileDocumentEntityModule(service, optionItemService);
  });
  
  describe('getters', () => {
    describe('categories', () => {
      test('the getter returns the sorted types', () => {
        module.mutations.setCategories(module.state, mockOptionItemData());
        const res = module.getters.categories(module.state)(false);
        expect(res).toEqual(
          _sortBy(
            mockOptionItemData().map((e) => new OptionItem(e)),
            'orderRank',
          ),
        );
      });
    });



    describe('getByCaseFile', () => {
      test('the getter returns the documents that have the id passed in the argument', () => {
        const document1 = mockCaseFileDocumentEntity({id: '1', caseFileId: 'case-file-1'});
        const document2 = mockCaseFileDocumentEntity({id: '2', caseFileId: 'case-file-2'});
        module.mutations.setAll(module.state, [document1, document2]);
        const res = module.getters.getByCaseFile(module.state)('case-file-1');
        expect(res).toEqual([document1]);
      });
      test('the getter ignores inactive documents', () => {
        const item1 = mockCaseFileDocumentEntity({id: '1', caseFileId: 'case-file-1', status: Status.Inactive});
        const item2 = mockCaseFileDocumentEntity({id: '2', caseFileId: 'case-file-1', status: Status.Active});
        module.mutations.setAll(module.state, [item1, item2]);
        const res = module.getters.getByCaseFile(module.state)('case-file-1');
        expect(res).toEqual([item2]);
      });
    });
  });

  describe('mutations', () => {
    describe('setCategories', () => {
      test('the setCategories mutation sets the state', () => {
        const items = mockOptionItemData();
        module.mutations.setCategories(module.state, items);
        expect(module.state.categories).toEqual(items);
      });
    });

    test('the setCategoriesFetched mutation sets the state', () => {
      module.mutations.setCategoriesFetched(module.state, true);
      expect(module.state.categoriesFetched).toEqual(true);
    });

  });

  describe('actions', () => {
    describe('fetchCategories', () => {
      it('should call optionItemService getOptionList and commit the result', async () => {
        const res = mockOptionItemData();
        module.optionItemService.getOptionList = jest.fn(() => Promise.resolve(res));
        await module.actions.fetchCategories(actionContext);

        expect(module.optionItemService.getOptionList).toBeCalledWith(EOptionLists.DocumentCategories);
        expect(actionContext.commit).toBeCalledWith('setCategories', res);
        expect(actionContext.commit).toBeCalledWith('setCategoriesFetched', true);
      });
    });
    describe('updateDocument', () => {
      it('should call service updateDocument and commit the result', async () => {
        module.service.updateDocument = jest.fn(() => Promise.resolve({ name: 'name2' } as ICaseFileDocumentEntity));
        await module.actions.updateDocument(actionContext, { name: 'name' } as ICaseFileDocumentEntity);

        expect(module.service.updateDocument).toBeCalledWith({ name: 'name' });
        expect(actionContext.commit).toBeCalledWith('set', { name: 'name2' });
      });
    });
    
    describe('downloadDocumentAsUrl', () => {
      it('should call service downloadDocumentAsUrl', async () => {
        module.service.downloadDocumentAsUrl = jest.fn();
        await module.actions.downloadDocumentAsUrl(actionContext, {item: { name: 'name' } as ICaseFileDocumentEntity, saveDownloadedFile: true});

        expect(module.service.downloadDocumentAsUrl).toBeCalledWith({ name: 'name' }, true);
      });
    });
  });
});
