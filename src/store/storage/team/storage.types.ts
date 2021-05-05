import { ITeam, ITeamSearchData, Team } from '@/entities/team';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { IAppUserData } from '@/entities/app-user';

export interface IStorage {
  getters: {
    team(): Team,
  },

  mutations: {
    resetTeam(): void;
  },

  actions: {
    getTeam(id: uuid): Promise<ITeam>;
    createTeam(payload: Team): Promise<ITeam>;
    editTeam(payload: Team): Promise<ITeam>;
    searchTeams(params: IAzureSearchParams): Promise<IAzureSearchResult<ITeamSearchData>>;
    addTeamMembers(teamMembers: IAppUserData[]): Promise<ITeam>;
    removeTeamMember(teamMemberId: uuid): Promise<ITeam>;
  }
}

export interface IStorageMock {
  getters: {
    team: jest.Mock<void> | jest.Mock<ITeam>;
  },

  mutations: {
    resetTeam: jest.Mock<void>;
  },

  actions: {
    getTeam: jest.Mock<void>;
    createTeam: jest.Mock<void>;
    editTeam: jest.Mock<void>;
    searchTeams: jest.Mock<void>;
    addTeamMembers: jest.Mock<void>;
    removeTeamMember: jest.Mock<void>;
  }
}
