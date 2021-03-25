import { ITeamSearchData, Team } from '@/entities/team';

export type IState = {
  getLoading: boolean;
  submitLoading: boolean;
  searchLoading: boolean;
  removeLoading: boolean;
  team: Team;
  cachedTeams: Array<ITeamSearchData>;
};
