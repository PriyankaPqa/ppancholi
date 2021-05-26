import {
  CaseFile, mockCaseFileActivities, mockCaseFilesSearchData, mockCaseNoteCategories,
} from '@/entities/case-file';
import { mockOptionItemData } from '@/entities/optionItem';
import { IStorageMock } from './storage.types';

export const mockStorageCaseFile = (): IStorageMock => ({
  getters: {
    caseFileById: jest.fn(),
    tagsOptions: jest.fn(),
    caseNoteCategories: jest.fn(() => mockCaseNoteCategories()),
    inactiveReasons: jest.fn(),
    closeReasons: jest.fn(),
  },

  actions: {
    fetchTagsOptions: jest.fn(),
    fetchInactiveReasons: jest.fn(() => mockOptionItemData()),
    fetchCloseReasons: jest.fn(),
    fetchCaseFileActivities: jest.fn(() => mockCaseFileActivities()),
    searchCaseFiles: jest.fn(),
    fetchCaseFile: jest.fn(() => new CaseFile(mockCaseFilesSearchData()[0])),
    setCaseFileTags: jest.fn(),
    setCaseFileStatus: jest.fn(),
    setCaseFileLabels: jest.fn(),
    setCaseFileIsDuplicate: jest.fn(),
    fetchActiveCaseNoteCategories: jest.fn(),
    addCaseNote: jest.fn(),
    setCaseFileTriage: jest.fn(() => new CaseFile(mockCaseFilesSearchData()[0])),
  },
});
