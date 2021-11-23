/* eslint-disable no-console */
import * as msal from '@azure/msal-browser';
import { loginRequest, msalConfig, tokenRequest } from '@/auth/constants/azureAD';
import { provider } from '@/services/provider';
import applicationInsights from '@/applicationInsights';

const msalInstance = new msal.PublicClientApplication(msalConfig);
const services = provider();

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
  async signIn(specificTenant?: string) {
    console.log('signin', specificTenant);
    const authority = specificTenant || 'common';
    await msalInstance.loginRedirect({
      ...loginRequest,
      redirectUri: window.location.origin,
      authority: `https://login.microsoftonline.com/${authority}`,
    });
  },

  /**
   * Signs the user out and redirects them to the logout URL
   */
  async signOut() {
    console.log('signout');
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
    console.log('acquireToken');
    // we will have an authority (tenantid)
    // if the current domain is directly associated with a tenant, which will be forced on the user
    const authority = await services.publicApi.getTenantByEmisDomain(window.location.host);
    if (!authority) console.log(`no tenants for ${window.location.host} we'll use the default tenant`);
    const accounts = msalInstance.getAllAccounts() || [];

    if (!accounts.length || (authority && !accounts.filter((a) => a.tenantId === authority)[0])) {
      if (authority) {
        await this.signIn(authority);
        return null;
      }
      throw new Error('User is not logged in.');
    }

    try {
      const account = accounts.filter((a) => a.tenantId === authority)[0]
        // in case or localhost or unofficial sites (feature branch) we'll use the main tenant
        || accounts[0];

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
        this.signIn();
      }
    }

    return null;
  },
};
