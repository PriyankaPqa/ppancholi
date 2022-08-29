import { IListOption } from '@libs/shared-lib/types';
import { IEntity, mockBaseData, Status } from '../base';

import {
  IUserAccountEntity, IFilter, FilterKey, AccountStatus, IUserAccountMetadata, IUserAccountCombined,
} from './userAccount.types';

export const mockListOption = (force?: Partial<IListOption>) : IListOption => ({
  optionItemId: '341d1526-1567-4188-a673-b8d30f954da8',
  specifiedOther: '',
  ...force,
});

export const mockUserFilters = (): IFilter[] => [
  {
    name: 'Team filter',
    filterKey: FilterKey.Teams,
    criteria: ['["TeamName", "Equal", "test"]'],
  },
  {
    name: 'Team filter 2',
    filterKey: FilterKey.Teams,
    criteria: [
      '["TeamName", "Equal", "test1"]',
    ],
  },
  {
    name: 'Case file filter',
    filterKey: FilterKey.CaseFiles,
    criteria: ['["caseFileName", "Equal", "test"]'],
  },
];

export const mockUserAccountEntity = (force?: Partial<IEntity>) : IUserAccountEntity => ({
  ...mockBaseData(),
  filters: mockUserFilters(),
  roles: [
    mockListOption(),
  ],
  accountStatus: AccountStatus.Active,
  status: Status.Active,
  ...force,
});

export const mockUserAccountMetadata = (force?: Partial<IUserAccountMetadata>): IUserAccountMetadata => ({
  ...mockBaseData(),
  displayName: 'Jane Smith',
  emailAddress: 'Jane.Smith@example.com',
  phoneNumber: '+5145555555',
  roleId: 'mock-role-id',
  roleName: {
    translation: {
      en: 'System Admin', fr: 'Sys Admin fr',
    },
  },
  teamCount: 1,
  teams: [{
    teamId: 'team-mock-id',
    teamTypeName: null,
    events: [],
    name: 'Test team 1',
  }],
  caseFilesCount: 10,
  openCaseFilesCount: 10,
  closeCaseFilesCount: 2,
  inactiveCaseFilesCount: 0,
  preferredLanguage: 'fr',
  givenName: 'Ja',
  surname: 'JJ',
  userPrincipalName: 'Jane Smith',
  assignedCaseFileCountByTeam: [
    {
      teamId: 'team-mock-id',
      allCaseFileCount: 2,
      openCaseFileCount: 1,
      closedCaseFileCount: 1,
      inactiveCaseFileCount: 0,
    },
  ],
  ...force,
});

export const mockUserAccountEntities = () : IUserAccountEntity[] => [
  mockUserAccountEntity({ id: '1' }),
  mockUserAccountEntity({ id: '2' }),
];

export const mockUserAccountMetadatum = () : IUserAccountMetadata[] => [
  mockUserAccountMetadata({ id: '1' }),
  mockUserAccountMetadata({ id: '2' }),
];

export const mockCombinedUserAccount = (force?: Partial<IEntity>): IUserAccountCombined => ({
  entity: mockUserAccountEntity(force),
  metadata: mockUserAccountMetadata(force),
});

export const mockCombinedUserAccounts = (): IUserAccountCombined[] => [
  mockCombinedUserAccount({ id: '1' }),
  mockCombinedUserAccount({ id: '2' }),
];
