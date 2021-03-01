import { IStorageMock } from './storage.types';

export const mockStorageAppUser = () : IStorageMock => ({

  getters: {
    appUsersWithInfo: jest.fn(),
    appUserWhere: jest.fn(),
  },

  actions: {
    fetchAllUsers: jest.fn(),
    fetchAppUsers: jest.fn(),
    fetchRoles: jest.fn(),
  },
});
