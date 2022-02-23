import { Role } from 'testcafe';
import AuthenticationProvider from '../auth/AuthenticationProvider';
import { UserRoles } from '../entities/user';
import { setLocalStorageItem } from './helpers/functions';
import { localStorageKeys } from '../constants/localStorage';

const HOME_PAGE_URL = 'http://localhost:8080/en/home';

export const userLevel6 = Role(HOME_PAGE_URL, async () => {
  await AuthenticationProvider.signIn(UserRoles.level6);

  // Add value to local storage so HTTP Client can fetch the token and fetchUserData works
  await setLocalStorageItem(localStorageKeys.accessToken.name, AuthenticationProvider.accessToken);
  await setLocalStorageItem(localStorageKeys.msalAccount.name, JSON.stringify(AuthenticationProvider.account));

  // See: https://dev.to/kauppfbi_96/test-msal-based-spas-with-cypress-4goe
  // We might need it for later
  // const tokens = AuthenticationProvider.getInjectTokens();
  // await setLocalStorageItem(tokens.accountKey, JSON.stringify(tokens.accountEntity));
  // await setLocalStorageItem(tokens.idTokenKey, JSON.stringify(tokens.idTokenEntity));
  // await setLocalStorageItem(tokens.accessTokenKey, JSON.stringify(tokens.accessTokenKey));
});
