import { mockOptionItemData } from '@libs/entities-lib/optionItem';
import { mockCaseFileActivities, mockCaseFileCount, mockCaseFileDetailedCount, mockCaseFileEntity, mockSearchOptimizedResults } from '@libs/entities-lib/case-file';
import { mockDetailedRegistrationResponse } from '@libs/entities-lib/household';

export function getMockExtensionComponents(entity = mockCaseFileEntity()) {
  return {
    getTagsOptions: jest.fn(() => mockOptionItemData()),
    getInactiveReasons: jest.fn(() => mockOptionItemData()),
    getCloseReasons: jest.fn(() => mockOptionItemData()),
    getScreeningIds: jest.fn(() => mockOptionItemData()),
    fetchTagsOptions: jest.fn(() => mockOptionItemData()),
    fetchInactiveReasons: jest.fn(() => mockOptionItemData()),
    fetchScreeningIds: jest.fn(() => mockOptionItemData()),
    fetchCloseReasons: jest.fn(() => mockOptionItemData()),
    fetchCaseFileActivities: jest.fn(() => mockCaseFileActivities()),
    fetchCaseFileAssignedCounts: jest.fn(() => mockCaseFileCount()),
    fetchCaseFileDetailedCounts: jest.fn(() => mockCaseFileDetailedCount()),
    setCaseFileTags: jest.fn(() => entity),
    setCaseFileStatus: jest.fn(() => entity),
    setCaseFileIsDuplicate: jest.fn(() => entity),
    setCaseFileLabels: jest.fn(() => entity),
    setCaseFileIdentityAuthentication: jest.fn(() => entity),
    setCaseFileTriage: jest.fn(() => entity),
    setCaseFileValidationOfImpact: jest.fn(() => entity),
    createCaseFile: jest.fn(() => mockDetailedRegistrationResponse()),
    assignCaseFile: jest.fn(() => entity),
    genericSetAction: jest.fn(),
    fetchRecentlyViewed: jest.fn(() => ['mock-id-1', 'mock-id-2']),
    addRecentlyViewed: jest.fn(() => ['mock-id-1', 'mock-id-2']),
    searchOptimized: jest.fn(() => mockSearchOptimizedResults()),
    getSearchOptimizedByIds: jest.fn(() => mockSearchOptimizedResults().value.map((x) => x.searchItem)),
  };
}
