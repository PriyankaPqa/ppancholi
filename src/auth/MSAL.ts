/* eslint-disable */
import * as msal from '@azure/msal-browser';
import applicationInsights from '@crctech/registration-lib/src/plugins/applicationInsights/applicationInsights';
import {
  AccountInfo,
  AuthenticationResult,
  EndSessionRequest,
  InteractionRequiredAuthError,
  PublicClientApplication,
  RedirectRequest,
  SilentRequest,
  Configuration, LogLevel, CacheOptions
} from "@azure/msal-browser";
import {BrowserAuthOptions} from "@azure/msal-browser/dist/config/Configuration";
import {localStorageKeys} from "../constants/localStorage";

export interface Options extends Configuration {
  loginRedirectRequest?: RedirectRequest,
  tokenRequest?: RedirectRequest,
  showConsole: boolean,
  enableLogger: boolean,
  enableAppInsights: boolean,
}

export interface IMSAL {
  loadAuthModule(caller?: string): Promise<boolean>
  setCurrentTenantDomain(tenant: string | null): void
  signIn(specificTenant?: string): void
  signOut(): void
  isAuthenticated(): Promise<boolean>
  acquireToken(caller?: string): Promise<string|null>
  startAccessTokenAutoRenewal(interval: number): void;
}

/**
 * ID Token
 * They should be used to validate that a user is who they claim to be and get additional useful information about them.
 * It shouldn't be used for authorization in place of an access token.
 * The claims it provides can be used for UX inside your application, as keys in a database, and providing access to the client application.
 *
 *
 * Access Token
 * Access tokens enable clients to securely call APIs protected by Azure.
 * Microsoft identity platform access tokens are JWTs, Base64 encoded JSON objects signed by Azure.
 * Clients should treat access tokens as opaque strings, as the contents of the token are intended for the resource only.
 */



export class MSAL implements IMSAL {
  public msalLibrary: PublicClientApplication;

  public account: AccountInfo | null;

  public currentDomainTenant: string;

  private readonly showConsole: boolean;

  private readonly enableAppInsights: boolean;

  private readonly tokenRenewalOffsetSeconds: number;

  private readonly auth: BrowserAuthOptions = {
    clientId: '',
    authority: 'common',
    redirectUri: window.location.origin,
    navigateToLoginRequestUrl: false,
  };

  private readonly cache: CacheOptions = {
    cacheLocation: 'sessionStorage', // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  };

  // Add here scopes for id token to be used at MS Identity Platform endpoints.
  private readonly loginRedirectRequest: RedirectRequest = {
    scopes: ['openid', 'profile', 'User.Read'],
  };

  // Add here scopes for access token to be used at MS Graph API endpoints.
  private readonly tokenRequest: RedirectRequest = {
    scopes: ['User.Read'],
  };

  public accessToken: string;

  constructor(options: Options) {
    if (!options.auth.clientId) {
      throw new Error('auth.clientId is required');
    }

    this.account = null;
    this.showConsole = options.showConsole;
    this.enableAppInsights = options.enableAppInsights;
    this.tokenRenewalOffsetSeconds = options.system.tokenRenewalOffsetSeconds;

    this.auth = {
      ...this.auth,
      ...options.auth
    };

    this.cache = {
      ...this.cache,
      ...options.cache
    };

    this.loginRedirectRequest = {
      ...this.loginRedirectRequest,
      ...options.loginRedirectRequest,
      redirectStartPage: window.location.href,
    };

    this.tokenRequest = {
      ...this.tokenRequest,
    ...options.tokenRequest
    };

    const system = options.enableLogger ? {
      loggerOptions: {
        loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
          if (containsPii) {
            return;
          }
          switch (level) {
            case msal.LogLevel.Error:
              console.error(message);
              return;
            case msal.LogLevel.Info:
              console.info(message);
              return;
            case msal.LogLevel.Verbose:
              console.debug(message);
              return;
            case msal.LogLevel.Warning:
              console.warn(message);
          }
        },
        logLevel: LogLevel.Verbose
      }} : {}


    const config: Configuration = {
      auth: this.auth,
      cache: this.cache,
      system: {
        ...system,
        ...options.system,
      }
    };

    this.msalLibrary = new msal.PublicClientApplication(config);

  }

  /**
   * Checks whether we are in the middle of a redirect and handles state accordingly. Only required for redirect flows.
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/initialization.md#redirect-apis
   */
  public loadAuthModule(caller?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.showConsole && console.debug(`loadAuthModule - Start - Called by ${caller}`)
      this.msalLibrary.handleRedirectPromise().then((resp: AuthenticationResult | null) => {
        this.handleResponse(resp)
        this.showConsole && console.debug('loadAuthModule - Done')
        resolve(true)
      }).catch((e) => {
        this.showConsole && console.error('loadAuthModule - Error', e)
        this.enableAppInsights && applicationInsights.trackTrace(
          'handleRedirectPromise - error',
          { e },
          'MSAL',
          'handleRedirectPromise'
        );
        reject(false)
      });
    });
  }

  /**
   * Set the current tenant, depending on the current URL
   * @param tenant
   */
  public setCurrentTenantDomain(tenant: string | null): void {
      this.showConsole && console.debug('setCurrentTenantDomain', tenant)
      this.currentDomainTenant = tenant
  }

  /**
   * Silently acquire an access token for a given set of scopes and return it
   * If this function is called within the renewal offset (5 min before expiration), or after the expiration, it will renew the token automatically.
   * If your session on the server is not valid, it will throw an InteractionRequiredAuthError which will force to call an interactive API
   * @param caller
   */
  public async acquireToken(caller?: string): Promise<string|null> {
    this.showConsole && console.debug(`acquireToken called by ${caller}`)

    this.showConsole && console.debug('CurrentDomain:' , this.currentDomainTenant)

    if (this.currentDomainTenant) { // If not in localhost
      await this.checkIfLoggedInCurrentTenant();
    }

    // TODO Remove when we're sure it does not go in. Normally because we make sure to call loadAuthModule
    if (!this.account) { // acquireToken might be called before loadAuthModule
      this.showConsole && console.debug(`acquireToken - no account`)
      this.enableAppInsights && applicationInsights.trackTrace(
        'acquireToken - no account',
        { account: this.account },
        'MSAL',
        'acquireToken'
      );
      // await this.loadAuthModule('MSAL - acquireToken');
    }

    this.showConsole && console.debug('acquireToken - account', this.account)
    this.enableAppInsights && applicationInsights.trackTrace(
      'acquireToken - account',
      { account: this.account },
      'MSAL',
      'acquireToken'
    );
    try {
      const silentRequest = this.getSilentRequest();
      const response = await this.msalLibrary.acquireTokenSilent(silentRequest);

      this.accessToken = response.accessToken;

      // Used by BE for convenience
      localStorage.setItem(localStorageKeys.accessToken.name, this.accessToken);

      this.showConsole && console.debug("acquireToken - success", response.accessToken);

      return response.accessToken;
    } catch (e) {
      this.showConsole && console.error("silent token acquisition fails", e);
      this.enableAppInsights && applicationInsights.trackTrace(
        'silent token acquisition fails',
        { },
        'MSAL',
        'acquireToken'
      );
      // user is required to interact with the server to provide credentials or consent for authentication/authorization.
      if (e instanceof InteractionRequiredAuthError) {
        this.showConsole && console.debug("acquiring token using redirect");
        this.enableAppInsights && applicationInsights.trackTrace(
          'acquiring token using redirect',
          { },
          'MSAL',
          'acquireToken');

        await this.msalLibrary.handleRedirectPromise();

        this.msalLibrary.acquireTokenRedirect(this.getInteractiveRequest())
          .catch((e) => {
            this.showConsole && console.error('acquireTokenRedirect error', e)
          });
      } else {
        this.showConsole && console.error('acquireToken error', e)
        this.enableAppInsights && applicationInsights.trackTrace(
          'acquireToken error - will trigger sign in method',
          {error: e },
          'MSAL',
          'acquireToken'
        );
        try {
          await this.msalLibrary.handleRedirectPromise();
        } catch (e) {
          this.showConsole && console.error('handleRedirectPromise error', e)
        }
        this.signIn();
      }
    }

    return null;
  }

  /**
   * Renew the accessToken by calling aquireToken every x ms.
   * acquireToken will then use the token in case or get a new one.
   * One should not open and inspect access tokens.
   * In order to make sure you always have a valid token you can call acquireTokenSilent at least once per hour.
   * @param interval
   */
  public startAccessTokenAutoRenewal(interval: number) {
    if (interval > this.tokenRenewalOffsetSeconds * 1000) {
      console.warn(`You may end up with expired token. Please use <= to ${this.tokenRenewalOffsetSeconds}`)
    }
    setInterval(async () => {
      const token = await this.acquireToken();
      this.showConsole && console.debug('Automatic token renewal', token)
    }, interval);
  }

  /**
   * Sign in
   * @param specificTenant
   */
  public signIn(specificTenant?: string): void {
    this.showConsole && console.debug('SignIn', this.loginRedirectRequest)
    this.msalLibrary.loginRedirect({
      ...this.loginRedirectRequest,
      authority: `https://login.microsoftonline.com/${specificTenant || 'common'}`,
    });
  }

  /**
   * Sign out
   */
  public signOut(): void {
    let account: AccountInfo | undefined;

    if (this.account) {
      account = this.account
    }

    localStorage.removeItem(localStorageKeys.accessToken.name);

    const logOutRequest: EndSessionRequest = {account};
    this.msalLibrary.logoutRedirect(logOutRequest);
  }

  /**
   * Check if user is authenticated or not
   */
  public async isAuthenticated(): Promise<boolean> {
    // handleRedirectPromise must be called and awaited on each page load before determining if a user is signed in or not
    return this.msalLibrary.handleRedirectPromise().then(() => {
      if (this.account) {
        this.showConsole && console.debug('isAuthenticated - account', true)
        this.enableAppInsights && applicationInsights.trackTrace(
          'isAuthenticated - account - true',
          {value: true },
          'MSAL',
          'isAuthenticated'
        );
        return true;
      }

      return this.msalLibrary.loginRedirect(this.loginRedirectRequest).then(() => {
        this.showConsole && console.debug('isAuthenticated - loginRedirect', true)
        this.enableAppInsights && applicationInsights.trackTrace(
          'isAuthenticated - loginRedirect',
          {value: true },
          'MSAL',
          'isAuthenticated'
        );
        return true;
      }).catch(() => {
        this.showConsole && console.error('isAuthenticated - loginRedirect', false)
        this.enableAppInsights && applicationInsights.trackTrace(
          'isAuthenticated - loginRedirect - false',
          {value: false },
          'MSAL',
          'isAuthenticated'
        );
        return false;
      });
    }).catch(() => {
      return false;
    });

  }

  /**
   * Build silent request for acquireToken
   * @private
   */
  private getSilentRequest(): SilentRequest {
    return {
      account: this.account,
      scopes: this.tokenRequest.scopes,
      authority: `https://login.microsoftonline.com/${this.account.tenantId}`,
      forceRefresh: false,
      redirectUri: `${window.location.origin}/auth.html` // When doing acquireTokenSilent, redirect to blank page to prevent issues
    }
  }

  private async checkIfLoggedInCurrentTenant() {
    this.showConsole && console.debug('checkIfLoggedInCurrentTenant')
    this.enableAppInsights && applicationInsights.trackTrace(
      'checkIfLoggedInCurrentTenant',
      {},
      'MSAL',
      'checkIfLoggedInCurrentTenant'
    );
    const accountForTenant = this.getAccountForCurrentTenant();

    if (!accountForTenant) {
      this.showConsole && console.debug('accountForTenant is null, will sign in')
      this.enableAppInsights && applicationInsights.trackTrace(
        'accountForTenant is null, will sign in',
        {accountForTenant},
        'MSAL',
        'checkIfLoggedInCurrentTenant'
      );
      try {
        await this.msalLibrary.handleRedirectPromise();
      } catch (e) {
        this.showConsole && console.error('handleRedirectPromise error', e)
      }

      this.signIn(this.currentDomainTenant);
    } else {
      if (this.account.localAccountId !== accountForTenant.localAccountId) {
        this.showConsole && console.debug('accountForTenant - Setting new account', accountForTenant)
        this.enableAppInsights && applicationInsights.trackTrace(
          'accountForTenant - Setting new account',
          {accountForTenant},
          'MSAL',
          'checkIfLoggedInCurrentTenant'
        );
        this.account = accountForTenant;
      }
    }
  }

  /**
   * Build the interactive request for acquireToken
   * @private
   */
  private getInteractiveRequest(): RedirectRequest {
    return {
      account: this.account,
      scopes: this.tokenRequest.scopes,
    }
  }

  /**
   * Calls getAllAccounts and determines the correct account to sign into, currently defaults to first account found in cache.
   * TODO: Add account chooser code
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
   */
  private getAccount(): AccountInfo | null {
    const currentAccounts = this.msalLibrary.getAllAccounts();
    this.showConsole && console.debug("Result if we would have used msal.getActiveAccount");
    this.showConsole && console.debug(this.msalLibrary.getActiveAccount());
    if (currentAccounts === null) {
      this.showConsole && console.debug("getAccount - No accounts detected");
      this.enableAppInsights && applicationInsights.trackTrace(
        'getAccount - No accounts detected',
        {},
        'MSAL',
        'getAccount'
      );
      return null;
    }

    if (currentAccounts.length > 1) {
      // Add choose account code here
      this.showConsole && console.debug("getAccount - Multiple accounts detected, need to add choose account code. For now we pick the first one");
      this.showConsole && console.table(currentAccounts);
      this.enableAppInsights && applicationInsights.trackTrace(
        'getAccount - Multiple accounts detected, need to add choose account code. For now we pick the first one',
        {currentAccounts},
        'MSAL',
        'getAccount'
      );
      return currentAccounts[0];
    } else if (currentAccounts.length === 1) {
      this.showConsole && console.debug("getAccount - one account");
      this.showConsole && console.table(currentAccounts);
      this.enableAppInsights && applicationInsights.trackTrace(
        'getAccount - one account',
        {currentAccounts},
        'MSAL',
        'getAccount'
      );
      return currentAccounts[0];
    }

    return null;
  }

  /**
   * Calls getAllAccounts and determines the correct account to sign into, currently defaults to first account found in cache.
   * TODO: Add account chooser code
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
   */
  private getAccountForCurrentTenant() : AccountInfo | null {
    if (this.account?.tenantId === this.currentDomainTenant) {
      this.showConsole && console.debug("The current account matches tenant id, so we return it");
      return this.account;
    }

    let currentAccounts = this.msalLibrary.getAllAccounts();
    this.showConsole && console.debug("Result if we would have used msal.getActiveAccount");
    this.showConsole && console.debug(this.msalLibrary.getActiveAccount());
    if (currentAccounts === null) {
      this.showConsole && console.debug("getAccountForCurrentTenant - No accounts detected");
      this.enableAppInsights && applicationInsights.trackTrace(
        'getAccountForCurrentTenant - No accounts detected',
        {},
        'MSAL',
        'getAccountForCurrentTenant'
      );
      return null;
    }
    if (currentAccounts.length > 1) {
      // Add choose account code here
      this.showConsole && console.debug("getAccountForCurrentTenant - Multiple accounts detected, need to add choose account code. For now we pick the first one matching current tenant");
      this.showConsole && console.table(currentAccounts);
      this.enableAppInsights && applicationInsights.trackTrace(
        'getAccountForCurrentTenant - Multiple accounts detected, need to add choose account code. For now we pick the first one matching current tenant',
        {currentAccounts, currentDomainTenant: this.currentDomainTenant},
        'MSAL',
        'getAccountForCurrentTenant'
      );
      this.showConsole && console.debug('currentDomainTenant', this.currentDomainTenant);
      return currentAccounts.filter((a) => a.tenantId === this.currentDomainTenant)[0]
    } else if (currentAccounts.length === 1) {
      this.showConsole && console.debug("getAccountForCurrentTenant - one account");
      this.showConsole && console.table(currentAccounts);
      this.enableAppInsights && applicationInsights.trackTrace(
        'getAccountForCurrentTenant - one account',
        {currentAccounts, currentDomainTenant: this.currentDomainTenant},
        'MSAL',
        'getAccountForCurrentTenant'
      );
      this.showConsole && console.debug('currentDomainTenant', this.currentDomainTenant);

      return currentAccounts.filter((a) => a.tenantId === this.currentDomainTenant)[0]
    }
  }

  /**
   * Handles the response from a redirect. If response is null, will check if we have any accounts and attempt to sign in.
   */
  private handleResponse(response: AuthenticationResult | null) {
    if (response !== null) { // coming back from a successful authentication redirect
      this.showConsole && console.debug('handleResponse - Set account with using response', response)
      this.account = response.account;
    } else { // not coming back from an auth redirect
      this.showConsole && console.debug('this.account', this.account)
      this.showConsole && console.debug('handleResponse - Will set account from method getAccount')
      this.account = this.getAccount();
      this.showConsole && console.debug('Set account to:')
      this.showConsole && console.debug(this.account)
      this.showConsole && console.debug('Current tenant id :', this.currentDomainTenant)
    }
  }
}
