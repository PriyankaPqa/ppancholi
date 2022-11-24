import {
  ICaseFileDocumentCombined, ICaseFileDocumentEntity, mockCaseFileDocumentEntity, mockCombinedCaseFileDocuments,
} from '@libs/entities-lib/case-file-document';
import { mockOptionItemData } from '@libs/entities-lib/optionItem';

import { BaseMock } from '../base/base.mock';

export class CaseFileDocumentStorageMock extends BaseMock<ICaseFileDocumentCombined, ICaseFileDocumentEntity> {
  constructor() {
    super(mockCombinedCaseFileDocuments(), mockCaseFileDocumentEntity());
  }

  protected getters = {
    ...this.baseGetters,
    categories: jest.fn(() => mockOptionItemData()),
  };

  protected actions = {
    ...this.baseActions,
    fetchCategories: jest.fn(() => mockOptionItemData()),
    updateDocument: jest.fn((payload: ICaseFileDocumentEntity) => payload),
    downloadDocumentAsUrl: jest.fn(() => 'fake url'),
  };

  protected mutations = {
    ...this.baseMutations,
    setCategoriesFetched: jest.fn(),
  };

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  });
}
