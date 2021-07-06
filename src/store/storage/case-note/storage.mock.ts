import {
  ICaseNoteCombined, ICaseNoteEntity, mockCaseNoteCategories, mockCaseNoteEntity, mockCombinedCaseNotes,
} from '@/entities/case-note';

import { BaseMock } from '../base/base.mock';

export class CaseNoteStorageMock extends BaseMock<ICaseNoteCombined, ICaseNoteEntity> {
  constructor() {
    super(mockCombinedCaseNotes(), mockCaseNoteEntity());
  }

  protected getters = {
    ...this.baseGetters,
    caseNoteCategories: jest.fn(() => mockCaseNoteCategories()),
  }

  protected actions = {
    ...this.baseActions,
    fetchCaseNoteCategories: jest.fn(),
    addCaseNote: jest.fn(() => mockCaseNoteEntity()),
    pinCaseNote: jest.fn(() => mockCaseNoteEntity()),
    editCaseNote: jest.fn(() => mockCaseNoteEntity()),
    searchCaseNotes: jest.fn(),
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
