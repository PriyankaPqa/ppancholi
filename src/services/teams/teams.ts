import {
  ITeam, ITeamData, IEditTeamRequest, ITeamSearchData, ICreateTeamRequest, IAddTeamMembersRequest,
} from '@/entities/team';
import { IUserAccountSearchData } from '@/entities/user-account';
import { IHttpClient } from '@/services/httpClient';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
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

  async addTeamMembers(teamId: uuid, teamMembers: IUserAccountSearchData[]): Promise<ITeamData> {
    const payload = {
      teamMemberIds: teamMembers.map((t) => t.userAccountId),
    } as IAddTeamMembersRequest;
    return this.http.patch(`/team/teams/${teamId}/add-team-members`, payload);
  }

  async removeTeamMember(teamId: uuid, teamMemberId: uuid): Promise<ITeamData> {
    return this.http.delete(`/team/teams/${teamId}/member/${teamMemberId}`);
  }

  private teamToEditTeamRequestPayload(team: ITeam) : IEditTeamRequest {
    const primaryContactMember = team.teamMembers.find((m) => m.isPrimaryContact);
    const primaryContact = {
      id: primaryContactMember.userAccountId,
      isPrimaryContact: true,
    };

    return {
      name: team.name,
      eventIds: team.events.map((e) => e.id),
      primaryContact,
      status: team.status,
    };
  }

  private teamToCreateTeamRequestPayload(team: ITeam) : ICreateTeamRequest {
    const teamMembers = team.teamMembers.map((m) => ({
      id: m.userAccountId,
      isPrimaryContact: m.isPrimaryContact,
    }));

    return {
      name: team.name,
      eventIds: team.events.map((e) => e.id),
      teamMembers,
      teamType: team.teamType,
    };
  }
}
