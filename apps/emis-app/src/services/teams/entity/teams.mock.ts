import {
  mockTeamEntity,
} from '@/entities/team';
import { mockDomainBaseService } from '@/services/base/base.mock';
import { ITeamsServiceMock } from './teams.types';

export const mockTeamsService = (): ITeamsServiceMock => ({
  ...mockDomainBaseService([mockTeamEntity()]),
  createTeam: jest.fn(() => mockTeamEntity()),
  editTeam: jest.fn(() => mockTeamEntity()),
  getTeamsAssignable: jest.fn(() => [mockTeamEntity()]),
  addTeamMembers: jest.fn(() => mockTeamEntity()),
  removeTeamMember: jest.fn(() => mockTeamEntity()),
  getTeamsAssigned: jest.fn(() => [mockTeamEntity()]),
});
