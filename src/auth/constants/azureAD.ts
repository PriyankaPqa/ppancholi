import { Configuration } from '@azure/msal-browser';
import { i18n } from '@/ui/plugins/i18n';

const clientId = process.env.VUE_APP_AUTH_AAD_CLIENTID;
const authority = process.env.VUE_APP_AUTH_AAD_AUTHORITY;
const navigateToLoginRequestUrl = process.env.VUE_APP_AUTH_AAD_NAVIGATE_TO_LOGIN_REQUEST_URL === 'true';
const apiPermissions = process.env.VUE_APP_AUTH_AAD_API_PERMISSIONS;

const adPolicies = {
  signUpSignIn: {
    name: '',
    authority,
  },
  forgotPassword: {
    name: '',
    authority,
  },
};

// Config object to be passed to MSAL on creation. For a full list of msal.js configuration parameters, visit https://azuread.github.io/microsoft-authentication-library-for-js/docs/msal/modules/_configuration_.html
const msalConfig: Configuration = {
  auth: {
    clientId,
    authority,
    knownAuthorities: [
      authority,
    ],
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl,
  },
  cache: {
    cacheLocation: 'localStorage' as 'localStorage' | 'sessionStorage', // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" to save cache in cookies to address trusted zones limitations in IE (see: https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/Known-issues-on-IE-and-Edge-Browser)
  },
};

/**
 * Scopes you enter here will be consented once you authenticate. For a full list of available authentication parameters,
 * visit https://azuread.github.io/microsoft-authentication-library-for-js/docs/msal/modules/_authenticationparameters_.html
 */
const loginRequest = {
  scopes: ['openid', 'profile'],
  extraQueryParameters: { ui_locales: i18n.locale },
};

// Add here scopes for access token to be used at the API endpoints.
const tokenRequest = {
  scopes: [apiPermissions],
};

const ssoRequest = {
  loginHint: 'user@example.com',
};

export {
  adPolicies, msalConfig, loginRequest, tokenRequest, ssoRequest,
};
