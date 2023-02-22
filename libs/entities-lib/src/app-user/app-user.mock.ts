import { UserRoles } from '@libs/entities-lib/user';
import { IRolesData, IAppUserData } from './app-user.types';

export const mockRolesData = (): IRolesData[] => [
  {
    id: '0',
    displayName: 'Contributor M',
    value: UserRoles.contributorIM,
  },
  {
    id: '1',
    displayName: 'General Manager',
    value: UserRoles.level6,
  },
  {
    id: '2',
    displayName: 'Contributor A',
    value: 'contributorIA',
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
