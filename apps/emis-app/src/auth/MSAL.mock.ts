import { AccountInfo } from '@azure/msal-browser';
import { localStorageKeys } from '@/constants/localStorage';

export default class MSALMock {
  public accessToken: string;

  private currentDomainTenant: string;

  public account: AccountInfo;

  public msalLibrary = {
    setNavigationClient(navigationClient: string) {
      return navigationClient;
    },
  };

  constructor() {
    this.account = JSON.parse(localStorage.getItem(localStorageKeys.msalAccount.name));
    this.accessToken = localStorage.getItem(localStorageKeys.accessToken.name);
  }

  signIn() {
    return true;
  }

  public setCurrentTenantDomain(tenant: string | null): void {
    this.currentDomainTenant = tenant;
  }

  public startAccessTokenAutoRenewal() {
    return false;
  }

  public loadAuthModule() {
    return true;
  }

  public isAuthenticated() {
    return true;
  }

  public acquireToken() {
    return this.accessToken;
  }

  public signOut() {
    return true;
  }
}
