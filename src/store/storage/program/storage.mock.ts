import { IStorageMock } from './storage.types';

export const mockStorageProgram = (): IStorageMock => ({
  getters: {
    getProgramById: jest.fn(),
  },

  actions: {
    createProgram: jest.fn(),
    updateProgram: jest.fn(),
    searchPrograms: jest.fn(() => ({
      odataCount: 1,
      odataContext: 'context',
      value: [],
    })),
    fetchProgram: jest.fn(),
  },
});
