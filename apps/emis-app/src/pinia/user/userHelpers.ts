import { localStorageKeys } from '@/constants/localStorage';
import { IMSALUserData, UserRoles } from '@libs/entities-lib/user';
import AuthenticationProvider from '../../auth/AuthenticationProvider';

export default {

  getUserData(roles: UserRoles[]): IMSALUserData | null {
    try {
      const account = JSON.parse(localStorage.getItem(localStorageKeys.msalAccount.name)) || AuthenticationProvider.account;
      const userData = { ...account.idTokenClaims, homeAccountId: account.homeAccountId } as IMSALUserData;
      userData.roles = roles;
      return userData;
    } catch (e) {
      return null;
    }
  },
};
