import {
  mockCaseFileActivities, mockCaseFileEntity,
} from '@/entities/case-file';
import { ICaseFilesServiceMock } from './case-files.types';

export const mockCaseFilesService = (): ICaseFilesServiceMock => ({
  fetchCaseFileActivities: jest.fn(() => mockCaseFileActivities()),
  setCaseFileTags: jest.fn(() => mockCaseFileEntity()),
  setCaseFileStatus: jest.fn(() => mockCaseFileEntity()),
  setCaseFileLabels: jest.fn(() => mockCaseFileEntity()),
  setCaseFileIsDuplicate: jest.fn(() => mockCaseFileEntity()),
  setCaseFileTriage: jest.fn(() => mockCaseFileEntity()),
  setCaseFileAssign: jest.fn(() => mockCaseFileEntity()),
  createCaseFile: jest.fn(() => mockCaseFileEntity()),
  setCaseFileValidationOfImpact: jest.fn(() => mockCaseFileEntity()),
});
