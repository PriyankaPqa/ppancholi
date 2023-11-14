import { User } from './user';
import { UserRoles } from './user.types';
import { mockUserL0, mockUsersData } from './user.mock';

const mockUserData = mockUsersData()[0];

describe('>>> User', () => {
  describe('>> constructor', () => {
    it('should instantiate id', () => {
      const user = new User(mockUserData);
      expect(user.id).toBe('1');
    });

    it('should instantiate email', () => {
      const user = new User(mockUserData);
      expect(user.email).toBe('test@test.ca');
    });

    it('should instantiate lastName', () => {
      const user = new User(mockUserData);
      expect(user.lastName).toBe('White');
    });

    it('should instantiate firstName', () => {
      const user = new User(mockUserData);
      expect(user.firstName).toBe('John');
    });

    it('should instantiate roles', () => {
      const user = new User(mockUserData);
      expect(user.roles).toEqual([UserRoles.level1]);
    });
  });
  describe('>> methods', () => {
    describe('getFullName', () => {
      test('should return first name and last name', () => {
        const user = new User(mockUserData);
        expect(user.getFullName()).toEqual('John White');
      });

      test('should return empty string if family_name is not defined', () => {
        const user = new User({
          oid: '',
          email: '',
          family_name: '',
          given_name: 'John',
          roles: [UserRoles.level1],
          homeAccountId: '',
        });
        expect(user.getFullName()).toEqual('');
      });

      test('should return empty string if given_name is not defined', () => {
        const user = new User({
          oid: '',
          email: '',
          family_name: 'White',
          given_name: '',
          roles: [UserRoles.level1],
          homeAccountId: '',
        });
        expect(user.getFullName()).toEqual('');
      });
    });

    describe('getInitials', () => {
      test('should return initials', () => {
        const user = new User(mockUserData);
        expect(user.getInitials()).toEqual('JW');
      });

      test('should return empty string if family_name is not defined', () => {
        const user = new User({
          oid: '',
          email: '',
          family_name: '',
          given_name: 'John',
          roles: [UserRoles.level1],
          homeAccountId: '',
        });
        expect(user.getInitials()).toEqual('');
      });

      test('should return empty string if given_name is not defined', () => {
        const user = new User({
          oid: '',
          email: '',
          family_name: 'White',
          given_name: '',
          roles: [UserRoles.level1],
          homeAccountId: '',
        });
        expect(user.getInitials()).toEqual('');
      });
    });

    describe('hasRole', () => {
      test('should return true if the user has the role', () => {
        const user = new User(mockUsersData()[0]);
        expect(user.hasRole(UserRoles.level1)).toBeTruthy();
      });

      test('should return false if the user does not have the role', () => {
        const user = new User(mockUsersData()[0]);
        expect(user.hasRole(UserRoles.level3)).toBeFalsy();
      });
    });

    describe('hasLevel', () => {
      test('should return true if the user has a higher level than the one passed', () => {
        const user = new User(mockUsersData()[3]);
        expect(user.hasLevel(UserRoles.level1)).toBeTruthy();
        expect(user.hasLevel(UserRoles.level2)).toBeTruthy();
        expect(user.hasLevel(UserRoles.level3)).toBeTruthy();
        expect(user.hasLevel(UserRoles.level4)).toBeTruthy();
      });

      test('when strictLevel, should return true if the user has exact level passed', () => {
        const user = new User(mockUsersData()[3]);
        expect(user.hasLevel(UserRoles.level1, true)).toBeFalsy();
        expect(user.hasLevel(UserRoles.level2, true)).toBeFalsy();
        expect(user.hasLevel(UserRoles.level3, true)).toBeFalsy();
        expect(user.hasLevel(UserRoles.level4, true)).toBeTruthy();
      });

      test('should return false if the user does not have a higher level than the one passed', () => {
        const user = new User(mockUsersData()[2]);
        expect(user.hasLevel(UserRoles.level4)).toBeFalsy();
      });

      test('should return false if the user has a role which does not have the notion of level', () => {
        const user = new User(mockUsersData()[6]);
        expect(user.hasLevel(UserRoles.level1)).toBeFalsy();
      });
    });

    describe('currentRole', () => {
      test('should return the first index of roles if user has role', () => {
        const user = new User(mockUsersData()[0]);
        expect(user.currentRole()).toEqual(UserRoles.level1);
      });
    });
  });

  describe('Level 0', () => {
    describe('hasLevel', () => {
      it('should return true if the user has level0', () => {
        const user = mockUserL0();
        expect(user.hasLevel(UserRoles.level0)).toBeTruthy();
      });
      it('should return false if the user doesnt have level0', () => {
        const user = mockUserL0();
        expect(user.hasLevel(UserRoles.level1)).toBeFalsy();
      });
    });
    describe('hasRole', () => {
      it('should return true if the user has the role', () => {
        const user = mockUserL0();
        expect(user.hasRole(UserRoles.level0)).toBeTruthy();
      });
      it('should return false if the user doesnt have the role', () => {
        const user = mockUserL0();
        expect(user.hasRole(UserRoles.level1)).toBeFalsy();
      });
    });
    describe('currentRole', () => {
      it('should return the first index of roles if user has role', () => {
        const user = new User(mockUsersData()[11]);
        expect(user.currentRole()).toEqual(UserRoles.level0);
      });
    });
  });
});
