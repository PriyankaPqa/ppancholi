import { ITeamData } from '@/entities/team';
import { IHttpClient } from '@/services/httpClient';
import { ISearchData } from '@/types';
import { ITeamsService } from './teams.types';

export class TeamsService implements ITeamsService {
  constructor(private readonly http: IHttpClient) {}

  async searchTeams(params: ISearchData): Promise<ITeamData[]> {
    return this.http.get('/search/teams', { params, isOData: true });
  }
}
