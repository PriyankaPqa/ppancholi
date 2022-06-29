import {
  mockCaseFileActivities, mockCaseFileEntity, mockCaseFileCount, mockCaseFileDetailedCount, mockCaseFileEntities,
} from '@/entities/case-file';
import { mockDomainBaseService } from '@libs/core-lib/services/base';
import { ICaseFilesServiceMock } from './case-files.types';

export const mockCaseFilesService = (): ICaseFilesServiceMock => ({
  ...mockDomainBaseService(mockCaseFileEntities()),
  fetchCaseFileActivities: jest.fn(() => mockCaseFileActivities()),
  setCaseFileTags: jest.fn(() => mockCaseFileEntity()),
  setCaseFileStatus: jest.fn(() => mockCaseFileEntity()),
  setCaseFileLabels: jest.fn(() => mockCaseFileEntity()),
  setCaseFileIsDuplicate: jest.fn(() => mockCaseFileEntity()),
  setCaseFileTriage: jest.fn(() => mockCaseFileEntity()),
  setCaseFileAssign: jest.fn(() => mockCaseFileEntity()),
  createCaseFile: jest.fn(() => mockCaseFileEntity()),
  setCaseFileValidationOfImpact: jest.fn(() => mockCaseFileEntity()),
  getCaseFileAssignedCounts: jest.fn(() => mockCaseFileCount()),
  fetchCaseFileDetailedCounts: jest.fn(() => mockCaseFileDetailedCount()),
  assignCaseFile: jest.fn(() => mockCaseFileEntity()),
  getSummary: jest.fn(() => mockCaseFileEntity()),
});
