import {
  IAllUserData, IAppUserAzureData, IRolesData, IAppUserData,
} from './app-user.types';

export const mockAllUsersData = (): IAllUserData[] => [
  {
    id: '0',
    displayName: 'John White',
    givenName: 'John',
    jobTitle: 'jobTitle',
    mail: null,
    userPrincipalName: 'johnwhite@test.com',
  },
  {
    id: '2',
    displayName: 'Lena Brown',
    givenName: 'Lena',
    jobTitle: 'jobTitle',
    mail: null,
    userPrincipalName: 'lenabrown@test.com',
  },
];

export const mockAppUserAzureData = (): IAppUserAzureData[] => [
  {
    id: '2',
    displayName: 'Lena Brown',
    roles: ['0', '1'],
  },
];

export const mockRolesData = (): IRolesData[] => [
  {
    id: '0',
    description: 'Description of role 0',
    displayName: 'Contributor M',
    isEnabled: true,
    origin: 'Application',
    value: 'contributorIM',
  },
  {
    id: '1',
    description: 'Description of role 1',
    displayName: 'General Manager',
    isEnabled: true,
    origin: 'Application',
    value: 'level6',
  },
];

export const mockAppUserData = (): IAppUserData[] => [
  {
    id: '2',
    displayName: 'Lena Brown',
    givenName: 'Lena',
    jobTitle: 'jobTitle',
    mail: null,
    userPrincipalName: 'lenabrown@test.com',
    roles: [mockRolesData()[0], mockRolesData()[1]],
  },
];
