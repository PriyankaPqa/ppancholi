import { IStorageMock } from './storage.types';

export const mockStorageUserAccount = () : IStorageMock => ({

  getters: {
    userAccounts: jest.fn(),
    userAccountById: jest.fn(),
    searchUserAccounts: jest.fn(),
  },

  actions: {
    fetchUserAccount: jest.fn(),
    fetchAllUserAccounts: jest.fn(),
    addRoleToUser: jest.fn(),
    deleteUserAccount: jest.fn(),
    searchUserAccounts: jest.fn(),
  },
});
