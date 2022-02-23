import {
  mockCaseFileActivities, mockCaseFileEntity, mockCaseFileCount, mockCaseFileDetailedCount, mockCaseFileEntities,
} from '@/entities/case-file';
import { ICaseFilesServiceMock } from './case-files.types';
import { mockDomainBaseService } from '@/services/base/base.mock';

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
});
