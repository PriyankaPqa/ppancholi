import { IStorageMock } from './storage.types';

export const mockStorageCaseFile = () : IStorageMock => ({
  getters: {
    caseFileById: jest.fn(),
  },

  actions: {
    searchCaseFiles: jest.fn(),
    fetchCaseFile: jest.fn(),
  },
});
