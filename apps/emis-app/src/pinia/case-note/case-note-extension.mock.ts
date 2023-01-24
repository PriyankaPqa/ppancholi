import { mockOptionItemData } from '@libs/entities-lib/optionItem';
import { mockCaseNoteEntity } from '@libs/entities-lib/case-note';

export function getMockCaseNoteExtensionComponents() {
  const options = mockOptionItemData();
  const caseNote = mockCaseNoteEntity();

  return {
    isSavingCaseNote: false,
    getCaseNoteCategories: jest.fn(() => options),
    fetchCaseNoteCategories: jest.fn(() => options),
    addCaseNote: jest.fn(() => caseNote),
    pinCaseNote: jest.fn(() => caseNote),
    editCaseNote: jest.fn(() => caseNote),
  };
}
