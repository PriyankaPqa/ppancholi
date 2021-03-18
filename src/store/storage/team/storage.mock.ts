import { IStorageMock } from './storage.types';

export const mockStorageTeam = () : IStorageMock => ({
  actions: {
    searchTeams: jest.fn(),
    getTeam: jest.fn(),
    createTeam: jest.fn(),
    editTeam: jest.fn(),
    addTeamMembers: jest.fn(),
    removeTeamMember: jest.fn(),
  },
});
