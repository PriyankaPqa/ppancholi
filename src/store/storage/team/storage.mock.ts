import { IStorageMock } from './storage.types';

export const mockStorageTeam = () : IStorageMock => ({

  getters: {

  },

  mutations: {

  },

  actions: {
    searchTeams: jest.fn(),
  },
});
