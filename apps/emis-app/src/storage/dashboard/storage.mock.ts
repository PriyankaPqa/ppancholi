import { IStorageMock } from './storage.types';

export const mockStorageDashboard = () : IStorageMock => ({
  mutations: {
    setProperty: jest.fn(),
  },
});
