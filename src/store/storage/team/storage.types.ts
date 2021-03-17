import { ITeam, ITeamSearchData } from '@/entities/team';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { IAppUserData } from '@/entities/app-user';

export interface IStorage {
  actions: {
    getTeam(id: uuid): Promise<ITeam>;
    createTeam(payload: ITeam): Promise<ITeam>;
    editTeam(payload: ITeam): Promise<ITeam>;
    searchTeams(params: IAzureSearchParams): Promise<IAzureSearchResult<ITeamSearchData>>;
    addTeamMembers(teamId: uuid, teamMembers: IAppUserData[]): Promise<ITeam>;
  }
}

export interface IStorageMock {
  actions: {
    getTeam: jest.Mock<void>;
    createTeam: jest.Mock<void>;
    editTeam: jest.Mock<void>;
    searchTeams: jest.Mock<void>;
    addTeamMembers: jest.Mock<void>;
  }
}
