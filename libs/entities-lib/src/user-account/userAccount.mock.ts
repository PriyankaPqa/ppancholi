import { IListOption, IUserInformation } from '@libs/shared-lib/types';
import { IEntity, mockBaseData, Status } from '../base';

import {
  IUserAccountEntity, IFilter, FilterKey, AccountStatus, IUserAccountMetadata, IUserAccountCombined, IUserProfileQueryResponse, IUserProfileData,
} from './userAccount.types';

export const mockUserInformation = (force?: Partial<IUserInformation>) : IUserInformation => ({
    userId: 'test-user-id-123456',
    userName: 'Mock user name',
    roleName: {
      translation: {
        en: 'System Admin',
        fr: 'System Admin in french',
      },
    },
    ...force,
});

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
  pinned: false,
});

export const mockCombinedUserAccounts = (): IUserAccountCombined[] => [
  mockCombinedUserAccount({ id: '1' }),
  mockCombinedUserAccount({ id: '2' }),
];

export const mockUserProfileData = (force?: Partial<IUserProfileData>): IUserProfileData => ({
  id: 'fc8e449b-cfe7-41ea-a74c-1db865b99ab0',
  displayName: 'Display Name',
  emailAddress: 'user@company.com',
  preferredLanguage: 'fr',
  givenName: 'First',
  surname: 'Last',
  userPrincipalName: 'upn@company.com',
  phoneNumber: '+15551212',
  ...force,
});

export const mockUserProfileQueryResponse = (force?: Partial<IUserProfileQueryResponse>): IUserProfileQueryResponse => ({
  ...mockUserProfileData(force),
  existsInEmis: false,
  ...force,
});

export const mockUserProfileQueryResponses = () : IUserProfileQueryResponse[] => [
  mockUserProfileQueryResponse({ id: '1', existsInEmis: true }),
  mockUserProfileQueryResponse({ id: '2', existsInEmis: false }),
];
