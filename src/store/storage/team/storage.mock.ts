import { mockSearchTeams, mockTeam } from '@/entities/team';
import { IStorageMock } from './storage.types';

export const mockStorageTeam = (): IStorageMock => ({
  getters: {
    team: jest.fn(),
  },

  mutations: {
    resetTeam: jest.fn(),
  },

  actions: {
    searchTeams: jest.fn(() => mockSearchTeams()),
    getTeam: jest.fn(),
    getTeamsAssignable: jest.fn(() => [mockTeam()]),
    createTeam: jest.fn(),
    editTeam: jest.fn(),
    addTeamMembers: jest.fn(),
    removeTeamMember: jest.fn(),
    searchAggregatedTeams: jest.fn(() => [mockTeam()]),
  },
});
