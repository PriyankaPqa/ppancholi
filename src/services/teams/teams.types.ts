import { ITeam, ITeamData, ITeamSearchData } from '@/entities/team';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { IAppUserData } from '@/entities/app-user';

export interface ITeamsService {
  createTeam(payload: ITeam): Promise<ITeamData>;
  editTeam(payload: ITeam): Promise<ITeamData>;
  getTeam(id: uuid): Promise<ITeamData>;
  searchTeams(params: IAzureSearchParams): Promise<IAzureSearchResult<ITeamSearchData>>;
  addTeamMembers(teamId: uuid, teamMembers: IAppUserData[]): Promise<ITeamData>;
}

export interface ITeamsServiceMock {
  createTeam: jest.Mock <ITeamData>;
  editTeam: jest.Mock <ITeamData>;
  getTeam: jest.Mock <ITeamData>;
  searchTeams: jest.Mock <IAzureSearchResult<ITeamSearchData>>;
  addTeamMembers: jest.Mock <ITeamData>;
}
