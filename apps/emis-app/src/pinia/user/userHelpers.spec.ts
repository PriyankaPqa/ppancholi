import { localStorageKeys } from '@/constants/localStorage';
import { UserRoles } from '@libs/entities-lib/user';
import AuthenticationProvider from '../../auth/AuthenticationProvider';
import { mockAuthenticationData } from '../../auth/authentication.mock';

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
      const roles = [UserRoles.level1];

      expect(userHelpers.getUserData(roles)).toEqual({
        ...authenticationData.account.idTokenClaims,
        homeAccountId: authenticationData.account.homeAccountId,
        roles: [UserRoles.level1],
      });
    });
  });
});
