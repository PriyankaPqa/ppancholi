import { IUserData } from './user.types';

export const mockUsersData = (): IUserData[] => [{
  oid: '1',
  email: 'test@test.ca',
  family_name: 'White',
  given_name: 'John',
  roles: ['level6', 'level1'],
}, {
  oid: '2',
  email: 'test@test.ca',
  family_name: 'Black',
  given_name: 'Peter',
  roles: ['contributor'],
},
{
  oid: '3',
  email: 'test@test.ca',
  family_name: 'Pink',
  given_name: 'Alan',
  roles: ['level1'],
}];
