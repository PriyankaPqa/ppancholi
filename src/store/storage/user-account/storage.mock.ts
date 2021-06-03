import { IStorageMock } from './storage.types';

export const mockStorageUserAccount = () : IStorageMock => ({

  getters: {
    userAccounts: jest.fn(),
    userAccountById: jest.fn(),
    searchUserAccounts: jest.fn(),
  },

  actions: {
    fetchAllUserAccounts: jest.fn(),
    fetchUserAccount: jest.fn(),
    addRoleToUser: jest.fn(),
    deleteUserAccount: jest.fn(),
    searchUserAccounts: jest.fn(),
  },
});
