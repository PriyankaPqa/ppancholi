import _intersection from 'lodash/intersection';
import { localStorageKeys } from '@/constants/localStorage';
import { IMSALUserData } from '@/entities/user';
import AuthenticationProvider from '@/auth/AuthenticationProvider';

export default {

  isSameRole(currentRoles: string[], previousRoles: string[]):boolean {
    if (!currentRoles || !currentRoles.length || !previousRoles || !previousRoles.length) {
      return false;
    }
    return !!_intersection(currentRoles, previousRoles).length;
  },

  getUserData(roles: string[]): IMSALUserData {
    const account = JSON.parse(localStorage.getItem(localStorageKeys.msalAccount.name)) || AuthenticationProvider.account;
    const userData = { ...account.idTokenClaims, homeAccountId: account.homeAccountId } as IMSALUserData;
    userData.roles = roles;
    return userData;
  },
};
