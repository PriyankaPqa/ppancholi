import { IAzureSearchResult } from '@/types';
import {
  ETeamStatus, ETeamType, ITeamData, ITeamEvent, ITeamMember, ITeamSearchData,
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

export const mockTeamMembers = (): ITeamMember[] => [
  {
    id: 'guid-member-1',
    isPrimaryContact: true,
    displayName: 'Mister Test',
    emailAddress: 'test@test.com',
    phoneNumber: '',
    roles: null,
    teamCount: 0,
    caseFilesCount: 0,
    openCaseFilesCount: 0,
    inactiveCaseFilesCount: 0,
  },
  {
    id: 'guid-member-2',
    isPrimaryContact: false,
    displayName: 'John White',
    emailAddress: 'john@test.com',
    phoneNumber: '',
    roles: null,
    teamCount: 0,
    caseFilesCount: 0,
    openCaseFilesCount: 0,
    inactiveCaseFilesCount: 0,
  },
];

export const mockTeamSearchData = (): ITeamSearchData[] => [
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
    teamMembers: mockTeamMembers(),
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
    teamMembers: mockTeamMembers(),
    teamStatusName: { translation: { en: 'Inactive', fr: 'Active' } },
  },
];

export const mockTeamMembersSearchData = () => mockTeamSearchData().reduce((flat, t) => flat.concat(t.teamMembers), []);

export const mockSearchTeams = (): IAzureSearchResult<ITeamSearchData> => ({
  odataCount: 2,
  odataContext: 'context',
  value: mockTeamSearchData(),
});

export const mockTeamsData = (): ITeamData[] => [
  {
    id: 'guid-team-1',
    name: 'Standard Active Team 1',
    teamType: ETeamType.Standard,
    status: ETeamStatus.Active,
    teamMembers: mockTeamMembers(),
    eventIds: ['id-1'],
  },
  {
    id: 'guid-team-2',
    name: 'AdHoc Inactive Team 1',
    teamType: ETeamType.AdHoc,
    status: ETeamStatus.Inactive,
    teamMembers: mockTeamMembers(),
    eventIds: ['id-1'],
  },
];
