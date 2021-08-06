import {
  mockTeamEntity,
} from '@/entities/team';
import { ITeamsServiceMock } from './teams.types';

export const mockTeamsService = (): ITeamsServiceMock => ({
  createTeam: jest.fn(() => mockTeamEntity()),
  editTeam: jest.fn(() => mockTeamEntity()),
  getTeamsAssignable: jest.fn(() => [mockTeamEntity()]),
  addTeamMembers: jest.fn(() => mockTeamEntity()),
  removeTeamMember: jest.fn(() => mockTeamEntity()),
});
