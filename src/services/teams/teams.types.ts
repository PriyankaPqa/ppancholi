import { ITeamData } from '@/entities/team';
import { ISearchData } from '@/types';

export interface ITeamsService {
  searchTeams(params: ISearchData): Promise<ITeamData[]>;
}

export interface ITeamsServiceMock {
  searchTeams: jest.Mock <ITeamData[]>;
}
