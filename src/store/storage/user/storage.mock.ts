import { IStorageMock } from './storage.types';

export const mockStorageUser = () : IStorageMock => ({

  getters: {
    user: jest.fn(),
    userId: jest.fn(),
    landingPage: jest.fn(),
  },

  mutations: {
    setUser: jest.fn(),
  },

  actions: {
    signOut: jest.fn(),
    fetchUserData: jest.fn(),
  },
});
