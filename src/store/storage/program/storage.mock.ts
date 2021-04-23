import { IStorageMock } from './storage.types';

export const mockStorageProgram = (): IStorageMock => ({
  actions: {
    createProgram: jest.fn(),
    searchPrograms: jest.fn(),
  },
});
