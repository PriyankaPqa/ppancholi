import {
  ITeamEntity, ITeamMember,
} from '@libs/entities-lib/team';
import { IHttpClient } from '../../http-client';
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
    return this.http.post('/team/teams', team, { globalHandler: false });
  }

  async editTeam(team: ITeamEntity): Promise<ITeamEntity> {
    const payload = this.teamToEditTeamRequestPayload(team);
    return this.http.patch(`/team/teams/${team.id}`, payload, { globalHandler: false });
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

  async getEscalationTeam(eventId: uuid): Promise<ITeamEntity> {
    return this.http.get(`team/teams/events/${eventId}/escalation`);
  }

  private teamToEditTeamRequestPayload(team: ITeamEntity) {
    return {
      name: team.name,
      eventIds: team.eventIds,
      primaryContact: team.teamMembers.find((m) => m.isPrimaryContact),
      status: team.status,
      isEscalation: team.isEscalation,
    };
  }
}
