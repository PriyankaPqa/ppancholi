import { ITeam, ITeamData } from '@/entities/team';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface ITeamsService {
  createTeam(payload: ITeam): Promise<ITeamData>;
  searchTeams(params: IAzureSearchParams): Promise<IAzureSearchResult<ITeamData>>;
}

export interface ITeamsServiceMock {
  createTeam: jest.Mock <ITeamData>;
  searchTeams: jest.Mock <IAzureSearchResult<ITeamData>>;
}
