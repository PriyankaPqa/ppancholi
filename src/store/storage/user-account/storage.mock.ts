import { IStorageMock } from './storage.types';

export const mockStorageUserAccount = () : IStorageMock => ({

  getters: {
    userAccountById: jest.fn(),
  },

  actions: {
    fetchUserAccount: jest.fn(),
  },
});
