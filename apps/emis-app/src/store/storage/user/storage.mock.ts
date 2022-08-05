import {
  mockUserL1,
} from '@libs/entities-lib/user';
import { IStorageMock } from './storage.types';

export const mockStorageUser = () : IStorageMock => ({

  getters: {
    user: jest.fn(() => mockUserL1()),
    userId: jest.fn(),
    landingPage: jest.fn(),
  },

  mutations: {
    setUser: jest.fn(),
  },

  actions: {
    signOut: jest.fn(),
    fetchUserData: jest.fn(),
    getCurrentRoles: jest.fn(),
    isRoleChanged: jest.fn(),
  },
});
