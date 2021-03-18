import {
  ITeam, ITeamData, IEditTeamRequest, ITeamSearchData, ICreateTeamRequest, IAddTeamMembersRequest,
} from '@/entities/team';
import { IHttpClient } from '@/services/httpClient';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { IAppUserData } from '@/entities/app-user';
import { ITeamsService } from './teams.types';

export class TeamsService implements ITeamsService {
  constructor(private readonly http: IHttpClient) {}

  async getTeam(id: uuid): Promise<ITeamData> {
    return this.http.get(`/team/teams/${id}`);
  }

  async createTeam(team: ITeam): Promise<ITeamData> {
    const payload = this.teamToCreateTeamRequestPayload(team);
    return this.http.post('/team/teams', payload, { globalHandler: false });
  }

  async editTeam(team: ITeam): Promise<ITeamData> {
    const payload = this.teamToEditTeamRequestPayload(team);
    return this.http.patch(`/team/teams/${team.id}`, payload, { globalHandler: false });
  }

  async searchTeams(params: IAzureSearchParams): Promise<IAzureSearchResult<ITeamSearchData>> {
    return this.http.get('/search/team-projections', { params, isOData: true });
  }

  async addTeamMembers(teamId: uuid, teamMembers: IAppUserData[]): Promise<ITeamData> {
    const payload = {
      teamMemberIds: teamMembers.map((t) => t.id),
    } as IAddTeamMembersRequest;
    return this.http.patch(`/team/teams/${teamId}/add-team-members`, payload);
  }

  async removeTeamMember(teamId: uuid, teamMemberId: uuid): Promise<ITeamData> {
    return this.http.delete(`/team/teams/${teamId}/member/${teamMemberId}`);
  }

  private teamToEditTeamRequestPayload(team: ITeam) : IEditTeamRequest {
    return {
      name: team.name,
      eventIds: team.events.map((e) => e.id),
      primaryContact: team.teamMembers.find((m) => m.isPrimaryContact),
      status: team.status,
    };
  }

  private teamToCreateTeamRequestPayload(team: ITeam) : ICreateTeamRequest {
    return {
      name: team.name,
      eventIds: team.events.map((e) => e.id),
      teamMembers: team.teamMembers,
      teamType: team.teamType,
    };
  }
}
