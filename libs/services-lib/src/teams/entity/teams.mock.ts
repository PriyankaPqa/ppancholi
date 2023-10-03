import {
  mockTeamEntity,
} from '@libs/entities-lib/team';
import { mockDomainBaseService } from '../../base';
import { ITeamsServiceMock } from './teams.types';

export const mockTeamsService = (): ITeamsServiceMock => ({
  ...mockDomainBaseService([mockTeamEntity()]),
  createTeam: jest.fn(() => mockTeamEntity()),
  editTeam: jest.fn(() => mockTeamEntity()),
  getTeamsAssignable: jest.fn(() => [mockTeamEntity()]),
  addTeamMembers: jest.fn(() => mockTeamEntity()),
  removeTeamMember: jest.fn(() => mockTeamEntity()),
  emptyTeam: jest.fn(() => mockTeamEntity()),
  getTeamsAssigned: jest.fn(() => [mockTeamEntity()]),
  getTeamsByEvent: jest.fn(() => [mockTeamEntity()]),
});
