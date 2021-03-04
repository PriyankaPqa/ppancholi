import { ITeam, ITeamData } from '@/entities/team';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface ITeamsService {
  createTeam(payload: ITeam): Promise<ITeamData>;
  editTeam(payload: ITeam): Promise<ITeamData>;
  getTeam(id: uuid): Promise<ITeamData>;
  searchTeams(params: IAzureSearchParams): Promise<IAzureSearchResult<ITeamData>>;
}

export interface ITeamsServiceMock {
  createTeam: jest.Mock <ITeamData>;
  editTeam: jest.Mock <ITeamData>;
  getTeam: jest.Mock <ITeamData>;
  searchTeams: jest.Mock <IAzureSearchResult<ITeamData>>;
}
