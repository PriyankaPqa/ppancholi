import { ITeam } from '@/entities/team';
import { ISearchData } from '@/types';

export interface IStorage {
  getters: {

  }

  mutations: {

  }

  actions: {
    searchTeams(params: ISearchData): Promise<ITeam[]>;
  }
}

export interface IStorageMock {
  getters: {

  }

  mutations: {

  }

  actions: {
    searchTeams: jest.Mock<void>;
  }
}
