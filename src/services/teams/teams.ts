import {
  ITeam, ITeamData, IEditTeamRequest, ITeamSearchData,
} from '@/entities/team';
import { IHttpClient } from '@/services/httpClient';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { ITeamsService } from './teams.types';

export class TeamsService implements ITeamsService {
  constructor(private readonly http: IHttpClient) {}

  async getTeam(id: uuid): Promise<ITeamData> {
    return this.http.get(`/team/teams/${id}`);
  }

  async createTeam(payload: ITeam): Promise<ITeamData> {
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
    const payload : IEditTeamRequest = {
      name: team.name,
      eventIds: team.eventIds,
      primaryContact: team.teamMembers.find((m) => m.isPrimaryContact),
      status: team.status,
    };

    return payload;
  }
}
