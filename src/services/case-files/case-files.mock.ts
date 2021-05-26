import { mockCaseFileActivities, mockCaseFilesData, mockSearchCaseFiles } from '@/entities/case-file';
import { ICaseFilesServiceMock } from './case-files.types';

export const mockCaseFilesService = (): ICaseFilesServiceMock => ({
  searchCaseFiles: jest.fn(() => mockSearchCaseFiles()),
  fetchCaseFileActivities: jest.fn(() => mockCaseFileActivities()),
  setCaseFileTags: jest.fn(() => mockCaseFilesData()[0]),
  setCaseFileStatus: jest.fn(() => mockCaseFilesData()[0]),
  setCaseFileLabels: jest.fn(() => mockCaseFilesData()[0]),
  setCaseFileIsDuplicate: jest.fn(() => mockCaseFilesData()[0]),
  setCaseFileTriage: jest.fn(() => mockCaseFilesData()[0]),
});
