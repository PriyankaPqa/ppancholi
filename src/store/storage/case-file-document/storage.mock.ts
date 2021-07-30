import {
  ICaseFileDocumentCombined, ICaseFileDocumentEntity, mockCaseFileDocumentEntity, mockCombinedCaseFileDocuments,
} from '@/entities/case-file-document';
import { mockOptionItemData } from '@/entities/optionItem';

import { BaseMock } from '../base/base.mock';

export class CaseFileDocumentStorageMock extends BaseMock<ICaseFileDocumentCombined, ICaseFileDocumentEntity> {
  constructor() {
    super(mockCombinedCaseFileDocuments(), mockCaseFileDocumentEntity());
  }

  protected getters = {
    ...this.baseGetters,
    categories: jest.fn(),
  }

  protected actions = {
    ...this.baseActions,
    fetchCategories: jest.fn(() => mockOptionItemData()),
  }

  protected mutations = {
    ...this.baseMutations,
  }

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  })
}
