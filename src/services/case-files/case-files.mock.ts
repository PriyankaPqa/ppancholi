import {
  mockCaseFileActivities, mockCaseFilesData, mockSearchCaseFiles,
} from '@/entities/case-file';
import { mockCaseNoteCategories, mockCaseNoteData, mockSearchCaseNotes } from '@/entities/case-file/case-note';
import { ICaseFilesServiceMock } from './case-files.types';

export const mockCaseFilesService = (): ICaseFilesServiceMock => ({
  searchCaseFiles: jest.fn(() => mockSearchCaseFiles()),
  fetchCaseFileActivities: jest.fn(() => mockCaseFileActivities()),
  setCaseFileTags: jest.fn(() => mockCaseFilesData()[0]),
  setCaseFileStatus: jest.fn(() => mockCaseFilesData()[0]),
  setCaseFileLabels: jest.fn(() => mockCaseFilesData()[0]),
  setCaseFileIsDuplicate: jest.fn(() => mockCaseFilesData()[0]),
  fetchActiveCaseNoteCategories: jest.fn(() => mockCaseNoteCategories()),
  addCaseNote: jest.fn(() => mockCaseNoteData()[0]),
  searchCaseNotes: jest.fn(() => mockSearchCaseNotes()),
  setCaseFileTriage: jest.fn(() => mockCaseFilesData()[0]),
});
