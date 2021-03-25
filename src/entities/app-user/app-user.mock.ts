import {
  IAllUserData, IAppUserAzureData, IRolesData, IAppUserData,
} from './app-user.types';

export const mockAllUsersData = (): IAllUserData[] => [
  {
    id: '0',
    mail: 'test0@test.com',
    mobilePhone: '',
    businessPhones: [],
  },
  {
    id: '1',
    mail: 'test1@test.com',
    mobilePhone: '',
    businessPhones: [],
  },
  {
    id: '2',
    mail: 'test2@test.com',
    mobilePhone: '',
    businessPhones: [],
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
    displayName: 'Contributor M',
    value: 'contributorIM',
  },
  {
    id: '1',
    displayName: 'General Manager',
    value: 'level6',
  },
];

export const mockAppUserData = (): IAppUserData[] => [
  {
    id: '2',
    displayName: 'Lena Brown',
    emailAddress: 'test2@test.com',
    phoneNumber: '',
    roles: [mockRolesData()[0], mockRolesData()[1]],
  },
  {
    id: '3',
    displayName: 'John Lenon',
    emailAddress: '',
    phoneNumber: '',
    roles: [mockRolesData()[0]],
  },
  {
    id: '4',
    displayName: 'Jack Jack',
    emailAddress: '',
    phoneNumber: '',
    roles: [mockRolesData()[0]],
  },
];
