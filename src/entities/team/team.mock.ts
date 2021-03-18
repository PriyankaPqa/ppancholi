import { IAzureSearchResult, IMultilingual } from '@/types';
import {
  ETeamStatus, ETeamType, ITeamData, ITeamMember, ITeamSearchData,
} from './team.types';

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
    teamStatus: 1,
    teamTypeName: { translation: { en: 'Standard', fr: 'FR-Standard' } },
    events: [
      {
        id: 'a94d958a-53b6-4ec8-acd3-d7221c02129f',
        name: { translation: { en: 'Test event 1 en', fr: 'Test event 1 fr' } },
      },
      {
        id: '76bac100-d38c-43b0-95e9-75092289231f',
        name: { translation: { en: 'Danh Test 2', fr: 'Test de danh 2' } },
      },
    ],
    teamMembers: [
      {
        id: '113e1ddf-6709-41a1-a155-a3f12260eebc',
        displayName: 'Alex',
        isPrimaryContact: true,
        emailAddress: null,
        phoneNumber: null,
        teamCount: 0,
        caseFilesCount: 0,
        openCaseFilesCount: 0,
        inactiveCaseFilesCount: 0,
        role: null,
      },
    ],
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
    teamStatus: 1,
    teamTypeName: { translation: { en: 'AdHoc', fr: 'AdHoc' } },
    events: [],
    teamMembers: [
      {
        id: 'cc1fe902-234a-4925-b94e-51d709922bae',
        displayName: 'John Brown',
        isPrimaryContact: true,
        emailAddress: null,
        phoneNumber: null,
        teamCount: 0,
        caseFilesCount: 0,
        openCaseFilesCount: 0,
        inactiveCaseFilesCount: 0,
        role: null,
      }],
  },
];

export const mockTeamMembersSearchData = () => mockTeamSearchData().reduce((flat, t) => flat.concat(t.teamMembers), []);

export const mockTeamMembers = (): ITeamMember[] => [
  {
    id: 'guid-member-1',
    isPrimaryContact: true,
    displayName: 'Mister Test',
    emailAddress: 'test@test.com',
    phoneNumber: '',
    role: null,
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
    role: null,
    teamCount: 0,
    caseFilesCount: 0,
    openCaseFilesCount: 0,
    inactiveCaseFilesCount: 0,
  },
];

export const mockTeamsData = (): ITeamData[] => [
  {
    id: 'guid-team-1',
    name: 'Standard Active Team 1',
    teamType: ETeamType.Standard,
    status: ETeamStatus.Active,
    teamMembers: mockTeamMembers(),
    events: [
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
    ],
  },
  {
    id: 'guid-team-2',
    name: 'AdHoc Inactive Team 1',
    teamType: ETeamType.AdHoc,
    status: ETeamStatus.Inactive,
    teamMembers: mockTeamMembers(),
    events: [
      {
        id: 'd52d45e8-1973-4d54-91f4-8ec0864f8ff9',
        name: {
          translation: {
            en: 'Event 1',
            fr: 'Event 1 - FR',
          },
        },
      },
    ],
  },
];

export const mockSearchTeams = (): IAzureSearchResult<ITeamSearchData> => ({
  odataCount: 2,
  odataContext: 'context',
  value: mockTeamSearchData(),
});
