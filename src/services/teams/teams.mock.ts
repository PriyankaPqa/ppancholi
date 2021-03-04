import { mockTeamsData, mockSearchTeams } from '@/entities/team';
import { ITeamsServiceMock } from './teams.types';

export const mockTeamsService = (): ITeamsServiceMock => ({
  searchTeams: jest.fn(() => mockSearchTeams()),
  createTeam: jest.fn(() => mockTeamsData()[0]),
  editTeam: jest.fn(() => mockTeamsData()[0]),
  getTeam: jest.fn(() => mockTeamsData()[0]),
});
