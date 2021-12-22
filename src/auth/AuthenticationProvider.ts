import { BrowserAuthOptions, BrowserSystemOptions } from '@azure/msal-browser/dist/config/Configuration';
import { BrowserCacheLocation, CacheOptions, RedirectRequest } from '@azure/msal-browser';
import { MSAL } from './MSAL';

const clientId = process.env.VUE_APP_AUTH_AAD_CLIENTID;
const authority = process.env.VUE_APP_AUTH_AAD_AUTHORITY;
const navigateToLoginRequestUrl = process.env.VUE_APP_AUTH_AAD_NAVIGATE_TO_LOGIN_REQUEST_URL === 'true';
const apiPermissions = process.env.VUE_APP_AUTH_AAD_API_PERMISSIONS;

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
    storeAuthStateInCookie: false, // Set this to "true" to save cache in cookies to address trusted zones limitations in IE (see: https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/Known-issues-on-IE-and-Edge-Browser)
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
  showConsole: true, // enable console added by us
  enableLogger: true, // process.env.NODE_ENV === 'development' && false, // enable logger by microsoft
  enableAppInsights: process.env.NODE_ENV === 'production',
};

export default new MSAL(msalConfig);
