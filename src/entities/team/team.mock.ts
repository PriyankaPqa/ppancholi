import { IAzureSearchResult } from '@/types';
import { Team } from '@/entities/team/team';
import { EUserAccountStatus } from '../user-account';
import {
  ETeamStatus, ETeamType, ITeam, ITeamData, ITeamEvent, ITeamMemberData, ITeamMemberSearchData, ITeamSearchData, ITeamSearchDataAggregate,
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

// User data received from teams projection
export const mockTeamMembersSearchData = (): ITeamMemberSearchData[] => [{
  id: 'guid-member-1',
  isPrimaryContact: true,
}, {
  id: 'guid-member-2',
  isPrimaryContact: false,
}];

// Data received from user-account projection
export const mockTeamMembersData = (): ITeamMemberData[] => [
  {
    userAccountId: 'guid-member-1',
    isPrimaryContact: true,
    displayName: 'Mister Test',
    givenName: 'Mister',
    surname: 'Test',
    tenantId: '...',
    userAccountStatus: EUserAccountStatus.Active,
    filters: [],
    emailAddress: 'test@test.com',
    phoneNumber: '',
    roleId: 'role-id-1',
    roleName: {
      translation: {
        en: 'Role 1',
        fr: 'Role 1',
      },
    },
    teamCount: 5,
    caseFilesCount: 3,
    openCaseFilesCount: 3,
    inactiveCaseFilesCount: 3,
  },
  {
    userAccountId: 'guid-member-2',
    isPrimaryContact: false,
    displayName: 'Missus Test2',
    givenName: 'Missus',
    surname: 'Test2',
    tenantId: '...',
    userAccountStatus: EUserAccountStatus.Active,
    filters: [],
    emailAddress: 'test2@test.com',
    phoneNumber: '',
    roleId: 'role-id-2',
    roleName: {
      translation: {
        en: 'Role 2',
        fr: 'Role 2',
      },
    },
    teamCount: 0,
    caseFilesCount: 0,
    openCaseFilesCount: 0,
    inactiveCaseFilesCount: 0,
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
  teamMembers: mockTeamMembersSearchData(),
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
    teamMembers: mockTeamMembersSearchData(),
    eventIds: ['id-1'],
  },
  {
    id: 'guid-team-2',
    name: 'AdHoc Inactive Team 1',
    teamType: ETeamType.AdHoc,
    status: ETeamStatus.Inactive,
    teamMembers: mockTeamMembersSearchData(),
    eventIds: ['id-1'],
  },
];

export const mockTeam = (): ITeam => new Team(mockTeamSearchDataAggregate()[0]);
