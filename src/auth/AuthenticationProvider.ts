import * as msal from '@azure/msal-browser';

import { localStorageKeys } from '@/constants/localStorage';
import { loginRequest, msalConfig, tokenRequest } from '@/auth/constants/azureAD';
import applicationInsights from '@/applicationInsights';

const msalInstance = new msal.PublicClientApplication(msalConfig);

let handleRedirectPromiseError: msal.AuthError;

/**
 * handleRedirectPromise parses the URL hash when redirecting from the login page.
 */
const handleRedirectPromise = msalInstance.handleRedirectPromise().then((redirect) => {
  if (redirect) {
    msalInstance.setActiveAccount(redirect.account);
  }
}).catch((error) => {
  applicationInsights.trackException(error, { context: 'AuthenticationProvider' });
  handleRedirectPromiseError = error;
});

export default {
  /**
   * Redirects the browser to the login page
   */
  async signIn(redirectStartPage?: string, tenantId?: string) {
    if (tenantId) localStorage.setItem(localStorageKeys.lastTenantId.name, tenantId);

    await msalInstance.loginRedirect({
      ...loginRequest,
      redirectStartPage,
      ...(tenantId ? { authority: `https://login.microsoftonline.com/${tenantId}` } : {}),
    });
  },

  /**
   * Signs the user out and redirects them to the logout URL
   */
  async signOut() {
    await msalInstance.logoutRedirect();
  },

  /**
   * Checks if the user has any logged in accounts, returns true if one or more
   * accounts are returned by getAllAccounts
   */
  async isSignedIn() {
    // Must wait for handleRedirectPromise to be resolved before we can check for accounts
    await handleRedirectPromise;

    if (handleRedirectPromiseError) {
      throw handleRedirectPromiseError;
    }

    const accounts = msalInstance.getAllAccounts();

    if (accounts && accounts.length) {
      return true;
    }

    return false;
  },

  /**
   * Attempts to acquire the token from msal. If this fails, the user should be
   * redirected to the login error page.
   */
  async acquireToken() {
    const accounts = msalInstance.getAllAccounts();

    if (!accounts || !accounts.length) {
      throw new Error('User is not logged in.');
    }

    try {
      const account = accounts.filter((a) => a.tenantId
        === (msalInstance.getActiveAccount()?.tenantId || localStorage.getItem(localStorageKeys.lastTenantId.name)))[0] || accounts[0];

      applicationInsights.trackTrace('account', { context: 'AuthenticationProvider', value: account });

      const tokenResponse = await msalInstance.acquireTokenSilent({
        account,
        scopes: tokenRequest.scopes,
        authority: `https://login.microsoftonline.com/${account.tenantId}`,
      });

      applicationInsights.trackTrace('tokenResponse', { context: 'AuthenticationProvider', value: tokenResponse });

      return tokenResponse;
    } catch (e) {
      // Redirect the application to the Microsoft login page if the 'login_required' error is thrown.
      // This error is thrown in cases where the refresh token has expired.
      // We may need to add other error types to this list in the future. Otherwise, all errors go to the LoginError.vue page

      applicationInsights.trackException(e, { context: 'AuthenticationProvider' });
      applicationInsights.trackException(e.errorCode, { context: 'AuthenticationProvider' });

      if (e.errorCode === 'login_required') {
        this.signIn(process.env.VUE_APP_AUTH_AAD_REDIRECT_URI);
      }
    }

    return null;
  },
};
