import { msalConfig, tokenRequest, loginRequest } from '@/constants/azureAD';
import { UserAgentApplication } from 'msal';
import { i18n } from '@/ui/plugins/i18n';
import routes from '@/constants/routes';

// Configure the redirect url for the MSAL configuration
const dashboardURL = `${window.location.origin}/${i18n.locale}/${routes.dashboard.path}`;
msalConfig.auth.redirectUri = dashboardURL;
msalConfig.auth.postLogoutRedirectUri = dashboardURL;

const msalObj = new UserAgentApplication(msalConfig);

export default {
  msalObj,
  accessToken: null,
  account: null,
  idToken: null,
  rawIdToken: null,
  idTokenExpiresOn: null,

  redirect() {
    this.msalObj.loginRedirect(loginRequest);
  },

  signOut() {
    // Removes all sessions, need to call AAD endpoint to do full logout
    this.msalObj.logout();
  },

  async getAccount() {
    const account = await this.msalObj.getAccount();
    return account;
  },

  async acquireTokenSilent() {
    await this.msalObj.acquireTokenSilent(tokenRequest).then((accessTokenResponse) => {
      this.accessToken = accessTokenResponse.accessToken;
      this.account = accessTokenResponse.account;
      this.rawIdToken = accessTokenResponse.idToken.rawIdToken;
      this.idTokenExpiresOn = accessTokenResponse.expiresOn;
    }).catch((error) => {
      // Acquire token silent failure, send an interactive request
      if (error.name === 'InteractionRequiredAuthError') {
        this.acquireTokenRedirect();
      } else {
        // TODO: EMISDEV-5731
      }
    });
  },

  acquireTokenRedirect() {
    this.msalObj.acquireTokenRedirect(tokenRequest);
  },
};
