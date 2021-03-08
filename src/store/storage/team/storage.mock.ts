import { IStorageMock } from './storage.types';

export const mockStorageTeam = () : IStorageMock => ({

  getters: {
    loading: jest.fn(),
  },

  actions: {
    searchTeams: jest.fn(),
    getTeam: jest.fn(),
    createTeam: jest.fn(),
    editTeam: jest.fn(),
  },
});
