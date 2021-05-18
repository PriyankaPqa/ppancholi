import { IStorageMock } from './storage.types';

export const mockStorageUserAccount = () : IStorageMock => ({

  getters: {
    userAccountById: jest.fn(),
    searchUserAccounts: jest.fn(),
  },

  actions: {
    fetchUserAccount: jest.fn(),
    addRoleToUser: jest.fn(),
    searchUserAccounts: jest.fn(),
  },
});
