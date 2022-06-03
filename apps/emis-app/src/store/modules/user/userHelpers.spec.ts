import { mockAuthenticationData } from '@/auth/authentication.mock';
import { localStorageKeys } from '@/constants/localStorage';
import AuthenticationProvider from '@/auth/AuthenticationProvider';

import userHelpers from './userHelpers';

describe('>>> Users Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isSameRole', () => {
    it('returns true if the 2 lists in the arguments have an element in common', () => {
      const list1 = ['a', 'b'];
      const list2 = ['c', 'b'];
      expect(userHelpers.isSameRole(list1, list2)).toEqual(true);
    });

    it('returns false if the 2 lists in the arguments have no element in common', () => {
      const list1 = ['a', 'b'];
      const list2 = ['c', 'd'];
      expect(userHelpers.isSameRole(list1, list2)).toEqual(false);
    });
  });

  describe('getUserData', () => {
    it('returns user data from account', () => {
      const authenticationData = mockAuthenticationData();
      global.localStorage.setItem(localStorageKeys.msalAccount.name, JSON.stringify(authenticationData.account));
      AuthenticationProvider.account = authenticationData.account;
      const roles = ['level1'];

      expect(userHelpers.getUserData(roles)).toEqual({
        ...authenticationData.account.idTokenClaims,
        homeAccountId: authenticationData.account.homeAccountId,
        roles: ['level1'],
      });
    });
  });
});
