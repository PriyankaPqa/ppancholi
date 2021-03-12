import {
  ITeam, ITeamData, IEditTeamRequest, ITeamSearchData, ICreateTeamRequest,
} from '@/entities/team';
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
