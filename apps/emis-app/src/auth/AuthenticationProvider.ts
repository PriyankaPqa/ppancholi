import { BrowserAuthOptions, BrowserSystemOptions } from '@azure/msal-browser/dist/config/Configuration';
import { BrowserCacheLocation, CacheOptions, RedirectRequest } from '@azure/msal-browser';
import { localStorageKeys } from '@/constants/localStorage';
import MSALMock from './MSAL.mock';
import { MSAL } from './MSAL';

// eslint-disable-next-line import/no-mutable-exports
let AuthenticationProvider = null as MSAL;

if (localStorage.getItem(localStorageKeys.automatedTests.name) === 'true') { // When test automation
  AuthenticationProvider = new MSALMock() as unknown as MSAL; // To resolve conflict with typing since we cannot make them fully compatible
} else {
  const clientId = process.env.VITE_AUTH_AAD_CLIENTID;
  const authority = process.env.VITE_AUTH_AAD_AUTHORITY;
  // Direct comparison with process.env variables in dev/prod does not seem to work well
  const navigateToLoginRequestUrlString = process.env.VITE_AUTH_AAD_NAVIGATE_TO_LOGIN_REQUEST_URL;
  const navigateToLoginRequestUrl = navigateToLoginRequestUrlString === 'true';
  const apiPermissions = process.env.VITE_AUTH_AAD_API_PERMISSIONS;

  const msalConfig = {
    auth: {
      clientId,
      authority,
      knownAuthorities: [
        authority,
      ],
      navigateToLoginRequestUrl,
    } as BrowserAuthOptions,
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
      // Set this to "true" to save cache in cookies to address trusted zones limitations in IE
      // (see: https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/Known-issues-on-IE-and-Edge-Browser)
      storeAuthStateInCookie: false,
    } as CacheOptions,
    system: {
      tokenRenewalOffsetSeconds: 300, // access token will be renewed 5 minutes before expiration (acquireToken) (instead of using cached)
    } as BrowserSystemOptions,
    loginRedirectRequest: {
      scopes: ['openid', 'profile'],
    } as RedirectRequest,
    tokenRequest: {
      scopes: [apiPermissions],
    } as RedirectRequest,
    showConsole: false, // enable console added by us
    enableLogger: false, // process.env.DEV && false, // enable logger by microsoft
    enableAppInsights: process.env.VITE_APP_ENV === 'production',
  };

  AuthenticationProvider = new MSAL(msalConfig);
}

export default AuthenticationProvider;
