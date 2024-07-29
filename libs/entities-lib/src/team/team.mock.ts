/* eslint-disable max-lines-per-function */
import { ISearchResult, Status } from '@libs/shared-lib/types';
import { IEventEntity } from '../event';
import { IEntity, mockBaseData } from '../base';
import {
  ITeamEntity, ITeamMember, TeamType,
} from './team.types';

export const mockTeamEvents = (): IEventEntity[] => [
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
] as any[];

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
  isEscalation: false,
  isAssignable: false,
  useForLodging: false,
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
  isEscalation: false,
  isAssignable: false,
  useForLodging: false,
  ...force,
});

export const mockTeamEntity = (force?: Partial<ITeamEntity>) => mockTeamsDataStandard(force);

export const mockTeamEntities = (force?: Partial<ITeamEntity>) : ITeamEntity[] => ([
  mockTeamsDataStandard(force),
  mockTeamsDataAddHoc(force),
]);

export const mockTeamSearchData: ISearchResult<ITeamEntity> = {
  odataContext: "https://emis-search-dev.search.windows.net/indexes('index-teams')/$metadata#docs(*)",
  odataCount: mockTeamEntities().length,
  value: mockTeamEntities().map((t) => ({
    ...t,
    id: t.id,
    tenantId: t.tenantId,
  })),
};
