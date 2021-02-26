import { ITeamData } from '@/entities/team';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface IStorage {
  actions: {
    searchTeams(params: IAzureSearchParams): Promise<IAzureSearchResult<ITeamData>>;
  }
}

export interface IStorageMock {
  actions: {
    searchTeams: jest.Mock<void>;
  }
}
