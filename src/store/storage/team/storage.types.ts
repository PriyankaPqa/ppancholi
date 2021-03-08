import { ITeam, ITeamSearchData } from '@/entities/team';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface IStorage {
  getters: {
    loading(): boolean,
  }

  actions: {
    getTeam(id: uuid): Promise<ITeam>;
    createTeam(payload: ITeam): Promise<ITeam>;
    editTeam(payload: ITeam): Promise<ITeam>;
    searchTeams(params: IAzureSearchParams): Promise<IAzureSearchResult<ITeamSearchData>>;
  }
}

export interface IStorageMock {
  getters: {
    loading: jest.Mock<void>;
  }

  actions: {
    getTeam: jest.Mock<void>;
    createTeam: jest.Mock<void>;
    editTeam: jest.Mock<void>;
    searchTeams: jest.Mock<void>;
  }
}
