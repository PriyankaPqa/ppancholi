import { IAzureSearchResult } from '@/types';
import { Team } from '@/entities/team/team';
import { mockCombinedUserAccount } from '@/entities/user-account';
import _sortBy from 'lodash/sortBy';
import {
  ETeamStatus, ETeamType, ITeam, ITeamData, ITeamEvent, ITeamMemberData, ITeamSearchData, ITeamSearchDataAggregate,
} from './team.types';

export const mockTeamEvents = (): ITeamEvent[] => [
  {
    id: 'd52d45e8-1973-4d54-91f4-8ec0864f8ff9',
    name: {
      translation: {
        en: 'Event 1',
        fr: 'Event 1 - FR',
      },
    },
  },
  {
    id: 'a52d45e8-1973-4d54-91f4-8ec0864f8ff9',
    name: {
      translation: {
        en: 'Event 2',
        fr: 'Event 2 - FR',
      },
    },
  },
];

// Data received from user-account projection
export const mockTeamMembersData = (): ITeamMemberData[] => [
  {
    ...mockCombinedUserAccount({ id: 'guid-member-1' }).entity,
    ...mockCombinedUserAccount({ id: 'guid-member-1' }).metadata,
    isPrimaryContact: true,
    id: 'guid-member-1',
  },
  {
    ...mockCombinedUserAccount({ id: 'guid-member-2' }).entity,
    ...mockCombinedUserAccount({ id: 'guid-member-2' }).metadata,
    isPrimaryContact: false,
    id: 'guid-member-2',
  },
];

export const mockTeamSearchDataAggregate = (): ITeamSearchDataAggregate[] => [
  {
    '@searchScore': 1,
    teamId: 'e64a9cd4-4e6b-46a7-b022-e93e0bdc24df',
    tenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
    teamName: 'Danh 2 Stad  L’Île aux Hérons',
    teamType: 1,
    eventCount: 2,
    primaryContactDisplayName: 'Test Six',
    teamMemberCount: 1,
    teamStatus: ETeamStatus.Active,
    teamTypeName: { translation: { en: 'Standard', fr: 'FR-Standard' } },
    events: mockTeamEvents(),
    teamMembers: mockTeamMembersData(),
    teamStatusName: { translation: { en: 'Active', fr: 'Actif' } },
  },
  {
    '@searchScore': 1,
    teamId: '6e2d49af-2f9a-4333-9bdb-cd37270e6591',
    tenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
    teamName: 'Team 2',
    teamType: 2,
    eventCount: 0,
    primaryContactDisplayName: 'Test Five',
    teamMemberCount: 1,
    teamStatus: ETeamStatus.Inactive,
    teamTypeName: { translation: { en: 'AdHoc', fr: 'AdHoc' } },
    events: mockTeamEvents(),
    teamMembers: mockTeamMembersData(),
    teamStatusName: { translation: { en: 'Inactive', fr: 'Active' } },
  },
];

export const mockTeamSearchData = (): ITeamSearchData[] => mockTeamSearchDataAggregate().map((t) => ({
  ...t,
  teamMembers: mockTeamMembersData(),
}));

export const mockSearchTeams = (): IAzureSearchResult<ITeamSearchData> => ({
  odataCount: 2,
  odataContext: 'context',
  value: mockTeamSearchData(),
});

export const mockSearchTeamsAggregate = (): IAzureSearchResult<ITeamSearchDataAggregate> => ({
  odataCount: 2,
  odataContext: 'context',
  value: mockTeamSearchDataAggregate(),
});

export const mockTeamsData = (): ITeamData[] => [
  {
    id: 'guid-team-1',
    name: 'Standard Active Team 1',
    teamType: ETeamType.Standard,
    status: ETeamStatus.Active,
    teamMembers: mockTeamMembersData(),
    eventIds: ['id-1'],
  },
  {
    id: 'guid-team-2',
    name: 'AdHoc Inactive Team 1',
    teamType: ETeamType.AdHoc,
    status: ETeamStatus.Inactive,
    teamMembers: mockTeamMembersData(),
    eventIds: ['id-1'],
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getOriginalData = (team: ITeam, wrapper: any) => ({
  name: team.name,
  status: team.status,
  events: wrapper.vm.teamType === 'standard' ? _sortBy(team.events, ['id']) : team.events[0],
  primaryContact: (wrapper.vm.currentPrimaryContact || {}).emailAddress,
});

export const mockTeam = (): ITeam => new Team(mockTeamSearchDataAggregate()[0]);
export const mockTeamTwo = (): ITeam => new Team(mockTeamSearchDataAggregate()[1]);
