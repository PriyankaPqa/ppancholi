import {
  ITeam, ITeamData, ITeamSearchData,
} from '@/entities/team';
import { IUserAccountSearchData } from '@/entities/user-account';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface ITeamsService {
  createTeam(payload: ITeam): Promise<ITeamData>;
  editTeam(payload: ITeam): Promise<ITeamData>;
  getTeam(id: uuid): Promise<ITeamData>;
  searchTeams(params: IAzureSearchParams): Promise<IAzureSearchResult<ITeamSearchData>>;
  addTeamMembers(teamId: uuid, teamMembers: IUserAccountSearchData[]): Promise<ITeamData>;
  removeTeamMember(teamId: uuid, teamMemberId: uuid) : Promise<ITeamData>;
}

export interface ITeamsServiceMock {
  createTeam: jest.Mock <ITeamData>;
  editTeam: jest.Mock <ITeamData>;
  getTeam: jest.Mock <ITeamData>;
  searchTeams: jest.Mock <IAzureSearchResult<ITeamSearchData>>;
  addTeamMembers: jest.Mock <ITeamData>;
  removeTeamMember: jest.Mock <ITeamData>;
}
