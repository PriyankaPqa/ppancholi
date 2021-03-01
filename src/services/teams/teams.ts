import { ITeam, ITeamData } from '@/entities/team';
import { IHttpClient } from '@/services/httpClient';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { ITeamsService } from './teams.types';

export class TeamsService implements ITeamsService {
  constructor(private readonly http: IHttpClient) {}

  async createTeam(payload: ITeam): Promise<ITeamData> {
    return this.http.post('/team/teams', payload, { globalHandler: false });
  }

  async searchTeams(params: IAzureSearchParams): Promise<IAzureSearchResult<ITeamData>> {
    return this.http.get('/search/teams', { params, isOData: true });
  }
}
