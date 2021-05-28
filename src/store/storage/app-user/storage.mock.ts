import { IStorageMock } from './storage.types';

export const mockStorageAppUser = () : IStorageMock => ({

  mutations: {
    invalidateAppUserCache: jest.fn(),
    invalidateAllUserCache: jest.fn(),
  },

  getters: {
    appUsersWithInfo: jest.fn(),
    appUserWhere: jest.fn(),
    searchAppUser: jest.fn(),
  },

  actions: {
    fetchAllUsers: jest.fn(),
    fetchAppUsers: jest.fn(),
    fetchRoles: jest.fn(),
    findAppUsers: jest.fn(),
  },
});
