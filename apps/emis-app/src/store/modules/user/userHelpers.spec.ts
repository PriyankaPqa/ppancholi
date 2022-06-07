import { mockAuthenticationData } from '@/auth/authentication.mock';
import { localStorageKeys } from '@/constants/localStorage';
import AuthenticationProvider from '@/auth/AuthenticationProvider';

import userHelpers from './userHelpers';

describe('>>> Users Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserData', () => {
    it('returns user data from account', () => {
      const authenticationData = mockAuthenticationData();
      global.localStorage.setItem(localStorageKeys.msalAccount.name, null);
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
