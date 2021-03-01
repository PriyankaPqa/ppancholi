import { mockTeamsData, mockSearchTeams } from '@/entities/team';
import { ITeamsServiceMock } from './teams.types';

export const mockTeamsService = (): ITeamsServiceMock => ({
  searchTeams: jest.fn(() => mockSearchTeams()),
  createTeam: jest.fn(() => mockTeamsData()[0]),
});
