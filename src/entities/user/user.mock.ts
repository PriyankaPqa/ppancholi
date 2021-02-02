import { IUserData } from './user.types';

export const mockUsersData = (): IUserData[] => [{
  oid: '1',
  email: 'test@test.ca',
  family_name: 'White',
  given_name: 'John',
  roles: ['level1'],
}, {
  oid: '2',
  email: 'test@test.ca',
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
}];
