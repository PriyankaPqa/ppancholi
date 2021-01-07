import { User } from './user';
import { mockUsersData } from './user.mock';

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
      expect(user.roles).toEqual(['level6', 'level5']);
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
          roles: [''],
        });
        expect(user.getFullName()).toEqual('');
      });

      test('should return empty string if given_name is not defined', () => {
        const user = new User({
          oid: '',
          email: '',
          family_name: 'White',
          given_name: '',
          roles: [''],
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
          roles: [''],
        });
        expect(user.getInitials()).toEqual('');
      });

      test('should return empty string if given_name is not defined', () => {
        const user = new User({
          oid: '',
          email: '',
          family_name: 'White',
          given_name: '',
          roles: [''],
        });
        expect(user.getInitials()).toEqual('');
      });
    });
  });
});
