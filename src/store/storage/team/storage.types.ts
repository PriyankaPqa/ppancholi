import { ITeam, ITeamData } from '@/entities/team';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface IStorage {
  getters: {
    loading(): boolean,
  }

  mutations: {

  }

  actions: {
    createTeam(payload: ITeam): Promise<ITeam>;
    searchTeams(params: IAzureSearchParams): Promise<IAzureSearchResult<ITeamData>>;
  }
}

export interface IStorageMock {
  getters: {
    loading: jest.Mock<void>;
  }

  mutations: {

  }

  actions: {
    createTeam: jest.Mock<void>;
    searchTeams: jest.Mock<void>;
  }
}
