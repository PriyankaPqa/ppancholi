import { IAzureSearchResult } from '@/types';
import {
  ETeamStatus, ETeamType, ITeamData,
} from './team.types';

export const mockTeamsData = (): ITeamData[] => [{
  id: 'guid-team-1',
  name: 'Standard Active Team 1',
  teamType: ETeamType.Standard,
  status: ETeamStatus.Active,
  teamMembers: [{
    id: 'guid-member-1',
    isPrimaryContact: true,
  }, {
    id: 'guid-member-2',
    isPrimaryContact: false,
  }],
  eventIds: [
    'd52d45e8-1973-4d54-91f4-8ec0864f8ff9',
    'a52d45e8-1973-4d54-91f4-8ec0864f8ff9',
  ],
}, {
  id: 'guid-team-2',
  name: 'AdHoc Inactive Team 1',
  teamType: ETeamType.AdHoc,
  status: ETeamStatus.Inactive,
  teamMembers: [{
    id: 'guid-member-1',
    isPrimaryContact: true,
  }],
  eventIds: [
    'd52d45e8-1973-4d54-91f4-8ec0864f8ff9',
    'a52d45e8-1973-4d54-91f4-8ec0864f8ff9',
  ],
}];

export const mockSearchTeams = (): IAzureSearchResult<ITeamData> => ({
  '@odataCount': 2,
  '@odataContext': 'context',
  value: mockTeamsData(),
});
