import { mockCaseNoteCategories, mockCaseNoteEntity } from '@libs/entities-lib/case-note';

export function getMockCaseNoteExtensionComponents() {
  const caseNote = mockCaseNoteEntity();

  return {
    isSavingCaseNote: false,
    getCaseNoteCategories: jest.fn(() => mockCaseNoteCategories()),
    fetchCaseNoteCategories: jest.fn(() => mockCaseNoteCategories()),
    addCaseNote: jest.fn(() => caseNote),
    pinCaseNote: jest.fn(() => caseNote),
    editCaseNote: jest.fn(() => caseNote),
  };
}
