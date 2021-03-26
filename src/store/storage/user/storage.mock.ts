import { IStorageMock } from './storage.types';

export const mockStorageUser = () : IStorageMock => ({

  getters: {
    user: jest.fn(),
    landingPage: jest.fn(),
    filtersByKey: jest.fn(),
  },

  mutations: {
    setUser: jest.fn(),
    setFilters: jest.fn(),
  },

  actions: {
    signOut: jest.fn(),
    fetchUserData: jest.fn(),
  },
});
