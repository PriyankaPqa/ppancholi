import {
  EFilterKey, IFilter, IFilterData, IUserAccountData, IUserData, IUser,
} from './user.types';

import { User } from './user';

export const mockUserFilters = (): IFilter[] => [
  {
    name: 'Team filter',
    filterKey: EFilterKey.Teams,
    criteria: [['TeamName', 'Equal', 'test']],
  },
  {
    name: 'Team filter 2',
    filterKey: EFilterKey.Teams,
    criteria: [
      ['TeamName', 'Equal', 'test1'],
    ],
  },
  {
    name: 'Case file filter',
    filterKey: EFilterKey.CaseFiles,
    criteria: [['caseFileName', 'Equal', 'test']],
  },
];

export const mockUserFiltersData = (): IFilterData[] => [
  {
    name: 'Team filter',
    filterKey: EFilterKey.Teams,
    criteria: ['["TeamName", "Equal", "test"]'],
  },
  {
    name: 'Team filter 2',
    filterKey: EFilterKey.Teams,
    criteria: [
      '["TeamName", "Equal", "test1"]',
    ],
  },
  {
    name: 'Case file filter',
    filterKey: EFilterKey.CaseFiles,
    criteria: ['["caseFileName", "Equal", "test"]'],
  },
];

export const mockUserAccount = () : IUserAccountData => ({
  id: '125',
  tenantId: '1254',
  created: '21',
  timestamp: 'string',
  status: 1,
  eTag: 'string',
  filters: mockUserFilters(),
});

export const mockUserData = (force?: Partial<IUserData>): IUserData => ({
  oid: '1',
  email: 'test@test.ca',
  family_name: 'White',
  given_name: 'John',
  roles: ['level1'],
  filters: mockUserFilters(),
  ...force,
});

export const mockUsersData = (): IUserData[] => [{
  oid: '1',
  email: 'test@test.ca',
  family_name: 'White',
  given_name: 'John',
  roles: ['level1'],
  filters: mockUserFilters(),
}, {
  oid: '2',
  email: undefined,
  preferred_username: 'test@test.ca',
  family_name: 'Black',
  given_name: 'Peter',
  roles: ['level2'],
  filters: mockUserFilters(),
},
{
  oid: '3',
  email: 'test@test.ca',
  family_name: 'Pink',
  given_name: 'Alan',
  roles: ['level3'],
  filters: mockUserFilters(),
},
{
  oid: '4',
  email: 'test@test.ca',
  family_name: 'Hilary',
  given_name: 'Purple',
  roles: ['level4'],
  filters: mockUserFilters(),

},
{
  oid: '5',
  email: 'test@test.ca',
  family_name: 'Tony',
  given_name: 'Brown',
  roles: ['level5'],
  filters: mockUserFilters(),
},
{
  oid: '6',
  email: 'test@test.ca',
  family_name: 'Jack',
  given_name: 'Orange',
  roles: ['level6'],
  filters: mockUserFilters(),
},
{
  oid: '7',
  email: 'test@test.ca',
  family_name: 'Joe',
  given_name: 'Pink',
  roles: ['contributorIM'],
  filters: mockUserFilters(),
},
{
  oid: '8',
  email: 'test@test.ca',
  family_name: 'Joe',
  given_name: 'Joe',
  roles: ['contributorFinance'],
  filters: mockUserFilters(),
},
{
  oid: '9',
  email: 'test@test.ca',
  family_name: 'Thomas',
  given_name: 'William',
  roles: ['contributor3'],
  filters: mockUserFilters(),
},
{
  oid: '10',
  email: 'test@test.ca',
  family_name: 'Lily',
  given_name: 'Park',
  roles: ['readonly'],
  filters: mockUserFilters(),
},
{
  oid: '11',
  email: 'test@test.ca',
  family_name: 'First',
  given_name: 'Albert',
  roles: undefined,
  filters: mockUserFilters(),
},
];

export const mockUserL1 = (): IUser => new User(mockUsersData()[0]);
export const mockUserL2 = (): IUser => new User(mockUsersData()[1]);
export const mockUserL3 = (): IUser => new User(mockUsersData()[2]);
export const mockUserL4 = (): IUser => new User(mockUsersData()[3]);
export const mockUserL5 = (): IUser => new User(mockUsersData()[4]);
export const mockUserL6 = (): IUser => new User(mockUsersData()[5]);
