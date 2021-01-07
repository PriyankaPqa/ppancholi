import { IHttpClient } from '@/services';
import ServicesUtil from '@/services/services-util';
import { UserAgentApplication } from 'msal';
import { loginRequest, msalConfig, tokenRequest } from '@/constants/azureAD';
import { IAuthenticationsService } from './authentications.types';
/* eslint-disable class-methods-use-this */

const msalObj = new UserAgentApplication(msalConfig);

function acquireTokenRedirect() {
  msalObj.acquireTokenRedirect(tokenRequest);
}

async function getAuthenticationAccount() {
  const account = await msalObj.getAccount();
  return account;
}

export class AuthenticationsService implements IAuthenticationsService {
  constructor(private readonly http: IHttpClient) {}

  async signIn() {
    try {
      msalObj.loginRedirect(loginRequest);

      return {
        success: true,
        status: null,
        statusText: null,
        data: null,
      };
    } catch (error) {
      return ServicesUtil.createErrorObject(error);
    }
  }

  async signOut() {
    // Removes all sessions, need to call AAD endpoint to do full logout
    await msalObj.logout();
  }

  async isSignedIn() {
    const account = await getAuthenticationAccount();
    return account !== null;
  }

  async getAccessToken() {
    try {
      const accessTokenResponse = await msalObj.acquireTokenSilent(tokenRequest);
      return {
        accessToken: accessTokenResponse.accessToken,
        account: accessTokenResponse.account,
        rawIdToken: accessTokenResponse.idToken.rawIdToken,
        idTokenExpiresOn: accessTokenResponse.expiresOn,
      };
    } catch (e) {
      // Acquire token silent failure, send an interactive request
      if (e.name === 'InteractionRequiredAuthError') {
        acquireTokenRedirect();
      } else {
        // TODO: EMISDEV-5731
      }
      return null;
    }
  }
}
