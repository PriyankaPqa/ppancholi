import {
  mockCaseFileActivities, mockCaseFileEntity, mockCaseFileCount, mockCaseFileDetailedCount, mockCaseFileEntities, mockTier2Response, mockTier2Details,
  mockCaseFileSummary,
  mockSearchOptimizedResults,
} from '@libs/entities-lib/case-file';
import { mockDetailedRegistrationResponse } from '@libs/entities-lib/household';
import { mockDomainBaseService } from '../../base';
import { ICaseFilesServiceMock } from './case-files.types';

export const mockCaseFilesService = (): ICaseFilesServiceMock => ({
  ...mockDomainBaseService(mockCaseFileEntities()),
  fetchCaseFileActivities: jest.fn(() => mockCaseFileActivities()),
  setCaseFileTags: jest.fn(() => mockCaseFileEntity()),
  setCaseFileStatus: jest.fn(() => mockCaseFileEntity()),
  setCaseFileLabels: jest.fn(() => mockCaseFileEntity()),
  setCaseFileIsDuplicate: jest.fn(() => mockCaseFileEntity()),
  setCaseFileTriage: jest.fn(() => mockCaseFileEntity()),
  setCaseFileIdentityAuthentication: jest.fn(() => mockCaseFileEntity()),
  createCaseFile: jest.fn(() => mockDetailedRegistrationResponse()),
  setCaseFileValidationOfImpact: jest.fn(() => mockCaseFileEntity()),
  getCaseFileAssignedCounts: jest.fn(() => mockCaseFileCount()),
  fetchCaseFileDetailedCounts: jest.fn(() => mockCaseFileDetailedCount()),
  assignCaseFile: jest.fn(() => mockCaseFileEntity()),
  getSummary: jest.fn(() => mockCaseFileSummary()),
  searchSummaries: jest.fn(() => ({ odataContext: '', odataCount: 1, value: [mockCaseFileSummary()] })),
  getAllCaseFilesRelatedToHouseholdId: jest.fn(() => mockCaseFileEntities()),
  setPersonReceiveAssistance: jest.fn(() => mockCaseFileEntity()),
  tier2ProcessStart: jest.fn(() => mockTier2Response()),
  getTier2Result: jest.fn(() => mockTier2Response()),
  getTier2Details: jest.fn(() => mockTier2Details()),
  getExceptionalTypeCounts: jest.fn(() => Promise.resolve([{ exceptionalAuthenticationTypeId: 'id1', caseFileCount: 3 }])),
  editRecoveryPlan: jest.fn(() => mockCaseFileEntity()),
  getRecentlyViewed: jest.fn(() => ['mock-case-file-id-1', 'mock-case-file-id-2']),
  addRecentlyViewed: jest.fn(() => ['mock-case-file-id-1', 'mock-case-file-id-2']),
  searchOptimized: jest.fn(() => mockSearchOptimizedResults()),
});
