import { ActionContext } from 'vuex';
import _sortBy from 'lodash/sortBy';

import { httpClient } from '@/services/httpClient';
import { CaseFileDocumentsService } from '@libs/services-lib/case-file-documents/entity';
import { OptionItemsService } from '@libs/services-lib/optionItems';

import { EOptionLists, mockOptionItemData, OptionItem } from '@libs/entities-lib/optionItem';
import { mockCaseFileDocumentEntity, ICaseFileDocumentEntity } from '@libs/entities-lib/case-file-document';
import { Status } from '@libs/entities-lib/base';
import { CaseFileDocumentEntityModule } from './caseFileDocumentEntity';
import { ICaseFileDocumentEntityState } from './caseFileDocumentEntity.types';
import { mockSignalR } from '../../../ui/plugins/signal-r';

const service = new CaseFileDocumentsService(httpClient);
const optionItemService = new OptionItemsService(httpClient);
const signalR = mockSignalR();
let myModule: CaseFileDocumentEntityModule;

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
    myModule = new CaseFileDocumentEntityModule(service, optionItemService, signalR);
  });

  describe('getters', () => {
    describe('categories', () => {
      test('the getter returns the sorted types', () => {
        myModule.mutations.setCategories(myModule.state, mockOptionItemData());
        const res = myModule.getters.categories(myModule.state)(false);
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
        const document1 = mockCaseFileDocumentEntity({ id: '1', caseFileId: 'case-file-1' });
        const document2 = mockCaseFileDocumentEntity({ id: '2', caseFileId: 'case-file-2' });
        myModule.mutations.setAll(myModule.state, [document1, document2]);
        const res = myModule.getters.getByCaseFile(myModule.state)('case-file-1');
        expect(res).toEqual([document1]);
      });
      test('the getter ignores inactive documents', () => {
        const item1 = mockCaseFileDocumentEntity({ id: '1', caseFileId: 'case-file-1', status: Status.Inactive });
        const item2 = mockCaseFileDocumentEntity({ id: '2', caseFileId: 'case-file-1', status: Status.Active });
        myModule.mutations.setAll(myModule.state, [item1, item2]);
        const res = myModule.getters.getByCaseFile(myModule.state)('case-file-1');
        expect(res).toEqual([item2]);
      });
    });
  });

  describe('mutations', () => {
    describe('setCategories', () => {
      test('the setCategories mutation sets the state', () => {
        const items = mockOptionItemData();
        myModule.mutations.setCategories(myModule.state, items);
        expect(myModule.state.categories).toEqual(items);
      });
    });

    test('the setCategoriesFetched mutation sets the state', () => {
      myModule.mutations.setCategoriesFetched(myModule.state, true);
      expect(myModule.state.categoriesFetched).toEqual(true);
    });
  });

  describe('actions', () => {
    describe('fetchCategories', () => {
      it('should call optionItemService getOptionList and commit the result', async () => {
        const res = mockOptionItemData();
        myModule.optionItemService.getOptionList = jest.fn(() => Promise.resolve(res));
        await myModule.actions.fetchCategories(actionContext);

        expect(myModule.optionItemService.getOptionList).toBeCalledWith(EOptionLists.DocumentCategories);
        expect(actionContext.commit).toBeCalledWith('setCategories', res);
        expect(actionContext.commit).toBeCalledWith('setCategoriesFetched', true);
      });
    });
    describe('updateDocument', () => {
      it('should call service updateDocument and commit the result', async () => {
        myModule.service.updateDocument = jest.fn(() => Promise.resolve({ name: 'name2' } as ICaseFileDocumentEntity));
        await myModule.actions.updateDocument(actionContext, { name: 'name' } as ICaseFileDocumentEntity);

        expect(myModule.service.updateDocument).toBeCalledWith({ name: 'name' });
        expect(actionContext.commit).toBeCalledWith('set', { name: 'name2' });
      });
    });

    describe('downloadDocumentAsUrl', () => {
      it('should call service downloadDocumentAsUrl', async () => {
        myModule.service.downloadDocumentAsUrl = jest.fn();
        await myModule.actions.downloadDocumentAsUrl(actionContext, { item: { name: 'name' } as ICaseFileDocumentEntity, saveDownloadedFile: true });

        expect(myModule.service.downloadDocumentAsUrl).toBeCalledWith({ name: 'name' }, true);
      });
    });
  });
});
