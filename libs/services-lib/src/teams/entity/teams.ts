import {
  ITeamEntity, ITeamMember,
} from '@libs/entities-lib/team';
import { IAzureCombinedSearchResult, IAzureSearchParams } from '@libs/shared-lib/src/types';
import { IEntity } from '@libs/entities-lib/src/base';
import { GlobalHandler, IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';

import { ITeamsService } from './teams.types';

const API_URL_SUFFIX = 'team';
const CONTROLLER = 'teams';

export class TeamsService extends DomainBaseService<ITeamEntity, uuid> implements ITeamsService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }

  async getTeamsAssignable(eventId: uuid): Promise<ITeamEntity[]> {
    return this.http.get(`/team/teams/events/${eventId}/assignable`);
  }

  async getTeamsAssigned(caseFileId: uuid): Promise<ITeamEntity[]> {
    return this.http.get(`/team/teams/case-files/${caseFileId}/assigned`);
  }

  async createTeam(team: ITeamEntity): Promise<ITeamEntity> {
    return this.http.post('/team/teams', team, { globalHandler: GlobalHandler.Partial });
  }

  async editTeam(team: ITeamEntity): Promise<ITeamEntity> {
    const payload = this.teamToEditTeamRequestPayload(team);
    return this.http.patch(`/team/teams/${team.id}`, payload, { globalHandler: GlobalHandler.Partial });
  }

  async addTeamMembers(teamId: uuid, teamMembers: ITeamMember[]): Promise<ITeamEntity> {
    return this.http.patch(`/team/teams/${teamId}/add-team-members`, { teamMemberIds: teamMembers.map((t) => t.id) });
  }

  async removeTeamMember(teamId: uuid, teamMemberId: uuid): Promise<ITeamEntity> {
    return this.http.delete(`/team/teams/${teamId}/member/${teamMemberId}`);
  }

  async emptyTeam(teamId: uuid): Promise<ITeamEntity> {
    return this.http.patch(`/team/teams/${teamId}/empty-team`);
  }

  async getTeamsByEvent(eventId: uuid, teamIds = '', includeInactive = false): Promise<ITeamEntity[]> {
    const filter = { Entity: { Events: { any: { Id: { value: eventId, type: 'guid' } } } } } as any;
    const params = { filter } as IAzureSearchParams;
    if (!includeInactive) {
      filter['Entity/Status'] = 'Active';
    }
    if (teamIds) {
      filter['Entity/Id'] = { in: teamIds };
    }
    return (await this.search(params))?.value?.map((t) => t.entity);
  }

  // eslint-disable-next-line
  async search(params: IAzureSearchParams & { manageableTeamsOnly?: boolean }, searchEndpoint: string = null, manageableTeamsOnly = false):
    Promise<IAzureCombinedSearchResult<ITeamEntity, IEntity>> {
    return this.http.get(`team/search/teamsV2?manageableTeamsOnly=${params.manageableTeamsOnly || manageableTeamsOnly}`, { params, isODataSql: true });
  }

  private teamToEditTeamRequestPayload(team: ITeamEntity) {
    return {
      name: team.name,
      eventIds: team.eventIds,
      primaryContact: team.teamMembers.find((m) => m.isPrimaryContact),
      status: team.status,
      isEscalation: team.isEscalation,
      isAssignable: team.isAssignable,
    };
  }
}
