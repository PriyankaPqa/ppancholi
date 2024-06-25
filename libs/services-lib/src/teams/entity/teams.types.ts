import {
  ITeamEntity, ITeamMember,
} from '@libs/entities-lib/team';
import { ICombinedSearchResult, ISearchParams } from '@libs/shared-lib/src/types';
import { IEntity } from '@libs/entities-lib/src/base';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface ITeamsService extends IDomainBaseService<ITeamEntity, uuid> {
  createTeam(payload: ITeamEntity): Promise<ITeamEntity>;
  editTeam(payload: ITeamEntity): Promise<ITeamEntity>;
  getTeamsAssignable(eventId: uuid): Promise<ITeamEntity[]>;
  addTeamMembers(teamId: uuid, teamMembers: ITeamMember[]): Promise<ITeamEntity>;
  removeTeamMember(teamId: uuid, teamMemberId: uuid) : Promise<ITeamEntity>;
  emptyTeam(teamId: uuid) : Promise<ITeamEntity>;
  getTeamsAssigned(caseFileId: uuid): Promise<ITeamEntity[]>;
  getTeamsByEvent({ eventId, teamIds, includeInactive, isEscalation } : { eventId: uuid, teamIds?:string[], includeInactive?: boolean, isEscalation?: boolean })
  : Promise<ITeamEntity[]>;
  search(params: ISearchParams & { manageableTeamsOnly?: boolean },
    searchEndpoint?: string, manageableTeamsOnly?: boolean):Promise<ICombinedSearchResult<ITeamEntity, IEntity>>;
}

export interface ITeamsServiceMock extends IDomainBaseServiceMock<ITeamEntity> {
  createTeam: jest.Mock <ITeamEntity>;
  editTeam: jest.Mock <ITeamEntity>;
  getTeamsAssignable: jest.Mock <ITeamEntity[]>;
  addTeamMembers: jest.Mock <ITeamEntity>;
  removeTeamMember: jest.Mock <ITeamEntity>;
  emptyTeam: jest.Mock <ITeamEntity>;
  getTeamsAssigned: jest.Mock <ITeamEntity[]>;
  getTeamsByEvent: jest.Mock <ITeamEntity[]>;
}
