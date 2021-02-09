import { IStorageMock } from './storage.types';

export const mockStorageRegistration = () : IStorageMock => ({
  getters: {
    event: jest.fn(),
  },

  actions: {
    fetchEvent: jest.fn(),
  },
});
