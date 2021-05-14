import { IStorageMock } from './storage.types';

export const mockStorageCaseFile = () : IStorageMock => ({
  getters: {
    caseFileById: jest.fn(),
    tagsOptions: jest.fn(),
  },

  actions: {
    fetchTagsOptions: jest.fn(),
    fetchCaseFileActivities: jest.fn(),
    searchCaseFiles: jest.fn(),
    fetchCaseFile: jest.fn(),
    setCaseFileTags: jest.fn(),
    setCaseFileLabels: jest.fn(),
    setCaseFileIsDuplicate: jest.fn(),
  },
});
