/* eslint-disable max-lines-per-function */
import { IEntity, mockBaseData, Status } from '../base';
import {
  ITeamEntity, ITeamMetadata, ITeamEvent, ITeamMember, TeamType, ITeamCombined,
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
export const mockTeamMembersData = (): ITeamMember[] => [
  {
    isPrimaryContact: true,
    id: 'guid-member-1',
  },
  {
    isPrimaryContact: false,
    id: 'guid-member-2',
  },
];

export const mockTeamsDataStandard = (force? : Partial<IEntity>): ITeamEntity => ({
  ...mockBaseData(),
  id: 'guid-team-1',
  name: 'Standard Active Team 1',
  teamType: TeamType.Standard,
  status: Status.Active,
  teamMembers: [mockTeamMembersData()[0]],
  eventIds: ['id-1'],
  ...force,
});

export const mockTeamsMetadataStandard = (force? : Partial<ITeamMetadata>): ITeamMetadata => ({
  ...mockBaseData(),
  id: 'guid-team-1',
  primaryContactDisplayName: 'Some Person',
  eventCount: 2,
  teamMemberCount: 1,
  events: [
    {
      id: '1',
      name: {
        translation: { en: 'Event 1', fr: 'Événement 1' },
      },
    },
    {
      id: '2',
      name: {
        translation: { en: 'Event 2', fr: 'Événement 2' },
      },
    },
  ],
  teamTypeName: { translation: { en: 'Standard', fr: 'FR-Standard' } },
  teamStatusName: { translation: { en: 'Active', fr: 'Actif' } },
  ...force,
});

export const mockTeamsDataAddHoc = (force? : Partial<IEntity>): ITeamEntity => ({
  ...mockBaseData(),
  id: 'guid-team-2',
  name: 'AdHoc Inactive Team 1',
  teamType: TeamType.AdHoc,
  status: Status.Inactive,
  teamMembers: mockTeamMembersData(),
  eventIds: ['id-1'],
  ...force,
});

export const mockTeamsMetadataAddHoc = (force? : Partial<ITeamMetadata>): ITeamMetadata => ({
  ...mockBaseData(),
  id: 'guid-team-2',
  primaryContactDisplayName: 'Some Person',
  eventCount: 1,
  teamMemberCount: 2,
  events: [
    {
      id: '1',
      name: {
        translation: { en: 'Event 1', fr: 'Événement 1' },
      },
    },
  ],
  teamTypeName: { translation: { en: 'Standard', fr: 'FR-Standard' } },
  teamStatusName: { translation: { en: 'Active', fr: 'Actif' } },
  ...force,
});

export const mockTeamEntity = () => mockTeamsDataStandard();

export const mockCombinedTeams = (): ITeamCombined[] => [
  {
    entity: mockTeamsDataStandard(),
    metadata: mockTeamsMetadataStandard(),
  },
  {
    entity: mockTeamsDataAddHoc(),
    metadata: mockTeamsMetadataAddHoc(),
  },
];

export const mockTeamSearchData = () => ({
  '@odata.context': "https://emis-search-dev.search.windows.net/indexes('index-teams')/$metadata#docs(*)",
  '@odata.count': mockCombinedTeams().length,
  value: mockCombinedTeams().map((t) => ({
    Metadata: t.metadata,
    Entity: t.entity,
  })),
}
);
