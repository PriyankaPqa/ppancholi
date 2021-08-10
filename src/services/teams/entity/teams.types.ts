import {
  ITeamEntity, ITeamMember,
} from '@/entities/team';

export interface ITeamsService {
  createTeam(payload: ITeamEntity): Promise<ITeamEntity>;
  editTeam(payload: ITeamEntity): Promise<ITeamEntity>;
  getTeamsAssignable(eventId: uuid): Promise<ITeamEntity[]>;
  addTeamMembers(teamId: uuid, teamMembers: ITeamMember[]): Promise<ITeamEntity>;
  removeTeamMember(teamId: uuid, teamMemberId: uuid) : Promise<ITeamEntity>;
  getTeamsAssigned(eventId: uuid): Promise<ITeamEntity[]>;
}

export interface ITeamsServiceMock {
  createTeam: jest.Mock <ITeamEntity>;
  editTeam: jest.Mock <ITeamEntity>;
  getTeamsAssignable: jest.Mock <ITeamEntity[]>;
  addTeamMembers: jest.Mock <ITeamEntity>;
  removeTeamMember: jest.Mock <ITeamEntity>;
  getTeamsAssigned: jest.Mock <ITeamEntity[]>;
}
