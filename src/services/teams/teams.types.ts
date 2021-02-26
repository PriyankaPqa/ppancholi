import { ITeamData, ITeam } from '@/entities/team';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface ITeamsService {
  searchTeams(params: IAzureSearchParams): Promise<IAzureSearchResult<ITeamData>>;
}

export interface ITeamsServiceMock {
  searchTeams: jest.Mock <IAzureSearchResult<ITeam>>;
}
