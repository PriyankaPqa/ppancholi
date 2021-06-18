import { IUserData, IUser } from './user.types';

import { User } from './user';

export const mockUserData = (force?: Partial<IUserData>): IUserData => ({
  oid: '1',
  email: 'test@test.ca',
  family_name: 'White',
  given_name: 'John',
  roles: ['level1'],
  ...force,
});

export const mockUsersData = (): IUserData[] => [{
  oid: '1',
  email: 'test@test.ca',
  family_name: 'White',
  given_name: 'John',
  roles: ['level1'],
}, {
  oid: '2',
  email: undefined,
  preferred_username: 'test@test.ca',
  family_name: 'Black',
  given_name: 'Peter',
  roles: ['level2'],
},
{
  oid: '3',
  email: 'test@test.ca',
  family_name: 'Pink',
  given_name: 'Alan',
  roles: ['level3'],
},
{
  oid: '4',
  email: 'test@test.ca',
  family_name: 'Hilary',
  given_name: 'Purple',
  roles: ['level4'],
},
{
  oid: '5',
  email: 'test@test.ca',
  family_name: 'Tony',
  given_name: 'Brown',
  roles: ['level5'],
},
{
  oid: '6',
  email: 'test@test.ca',
  family_name: 'Jack',
  given_name: 'Orange',
  roles: ['level6'],
},
{
  oid: '7',
  email: 'test@test.ca',
  family_name: 'Joe',
  given_name: 'Pink',
  roles: ['contributorIM'],
},
{
  oid: '8',
  email: 'test@test.ca',
  family_name: 'Joe',
  given_name: 'Joe',
  roles: ['contributorFinance'],
},
{
  oid: '9',
  email: 'test@test.ca',
  family_name: 'Thomas',
  given_name: 'William',
  roles: ['contributor3'],
},
{
  oid: '10',
  email: 'test@test.ca',
  family_name: 'Lily',
  given_name: 'Park',
  roles: ['readonly'],
},
{
  oid: '11',
  email: 'test@test.ca',
  family_name: 'First',
  given_name: 'Albert',
  roles: undefined,
},
];

export const mockUserL1 = (): IUser => new User(mockUsersData()[0]);
export const mockUserL2 = (): IUser => new User(mockUsersData()[1]);
export const mockUserL3 = (): IUser => new User(mockUsersData()[2]);
export const mockUserL4 = (): IUser => new User(mockUsersData()[3]);
export const mockUserL5 = (): IUser => new User(mockUsersData()[4]);
export const mockUserL6 = (): IUser => new User(mockUsersData()[5]);
