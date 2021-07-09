import {
  ITeam, ITeamMemberData, ITeamSearchData, Team,
} from '@/entities/team';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface IStorage {
  getters: {
    team(): Team;
  };

  mutations: {
    resetTeam(): void;
  };

  actions: {
    getTeam(id: uuid): Promise<ITeam>;
    getTeamsAssignable(id: uuid): Promise<ITeam[]>;
    createTeam(payload: ITeam): Promise<ITeam>;
    editTeam(payload: ITeam): Promise<ITeam>;
    searchTeams(params: IAzureSearchParams): Promise<IAzureSearchResult<ITeamSearchData>>;
    addTeamMembers(teamMembers: ITeamMemberData[]): Promise<ITeam>;
    removeTeamMember(teamMemberId: uuid): Promise<ITeam>;
    searchAggregatedTeams(params: IAzureSearchParams): Promise<ITeam[]>;
  };
}

export interface IStorageMock {
  getters: {
    team: jest.Mock<void> | jest.Mock<ITeam>;
  };

  mutations: {
    resetTeam: jest.Mock<void>;
  };

  actions: {
    getTeam: jest.Mock<void>;
    getTeamsAssignable: jest.Mock<ITeam[]>;
    createTeam: jest.Mock<void>;
    editTeam: jest.Mock<void>;
    searchTeams: jest.Mock<IAzureSearchResult<ITeamSearchData>>;
    addTeamMembers: jest.Mock<void>;
    removeTeamMember: jest.Mock<void>;
    searchAggregatedTeams: jest.Mock<ITeam[]>;
  };
}
