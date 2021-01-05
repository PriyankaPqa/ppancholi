import { IHttpClient } from '@/services';
import ServicesUtil from '@/services/services-util';
import MsalService from './msal-service';
import { IAuthenticationsService } from './authentications.types';
/* eslint-disable class-methods-use-this */
export class AuthenticationsService implements IAuthenticationsService {
  /* eslint-disable no-useless-constructor */
  constructor(private readonly http: IHttpClient) {}

  async signIn() {
    try {
      MsalService.redirect();
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
    await MsalService.signOut();
  }

  async authorize(selectedRoleId?: string) {
    try {
      const res = await this.http.post('/Authorize', { selectedRoleId });
      return ServicesUtil.responseBuilder(res);
    } catch (error) {
      return ServicesUtil.createErrorObject(error);
    }
  }

  async getAuthenticationAccount() {
    return MsalService.getAccount();
  }

  async isSignedIn() {
    const account = await MsalService.getAccount();
    return account !== null;
  }

  async getAccessToken() {
    await MsalService.acquireTokenSilent();
    return {
      accessToken: MsalService.accessToken,
      rawIdToken: MsalService.rawIdToken,
      idTokenExpiresOn: MsalService.idTokenExpiresOn,
      account: MsalService.account,
    };
  }
}
