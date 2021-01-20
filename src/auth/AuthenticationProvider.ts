import * as msal from '@azure/msal-browser';

import { loginRequest, msalConfig, tokenRequest } from '@/auth/constants/azureAD';

const msalInstance = new msal.PublicClientApplication(msalConfig);

let handleRedirectPromiseError: msal.AuthError;

/**
 * handleRedirectPromise parses the URL hash when redirecting from the login page.
 */
const handleRedirectPromise = msalInstance.handleRedirectPromise()
  .catch((error) => {
    handleRedirectPromiseError = error;
  });

export default {
  /**
   * Redirects the browser to the login page
   */
  async signIn(redirectStartPage?: string) {
    await msalInstance.loginRedirect({
      ...loginRequest,
      redirectStartPage,
    });
  },

  /**
   * Signs the user out and redirects them to the logout URL
   */
  signOut() {
    msalInstance.logout();
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

    const tokenResponse = await msalInstance.acquireTokenSilent({
      account: accounts[0],
      scopes: tokenRequest.scopes,
    });

    return tokenResponse;
  },
};
