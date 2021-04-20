import { IStorageMock } from './storage.types';

export const mockStorageCaseFile = () : IStorageMock => ({
  getters: {
  },

  actions: {
    searchCaseFiles: jest.fn(),
  },
});
