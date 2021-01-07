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
});
