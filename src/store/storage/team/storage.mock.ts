import { IStorageMock } from './storage.types';

export const mockStorageTeam = () : IStorageMock => ({
  getters: {
    team: jest.fn(),
  },

  mutations: {
    resetTeam: jest.fn(),
  },

  actions: {
    searchTeams: jest.fn(),
    getTeam: jest.fn(),
    createTeam: jest.fn(),
    editTeam: jest.fn(),
    addTeamMembers: jest.fn(),
    removeTeamMember: jest.fn(),
  },
});
