/* eslint-disable */

import axios from 'axios';
import {decode, JwtPayload} from 'jsonwebtoken';
import {AccountInfo} from '@azure/msal-browser';
import {UserRoles} from "../../entities/user";

export interface ITokens {
  accountKey: string,
  accountEntity: Record<string, unknown>,
  accessTokenKey: string,
  accessTokenEntity: Record<string, unknown>,
  idTokenKey: string,
  idTokenEntity: Record<string, unknown>,
}

export default class MSALMock {
    private readonly tenantId: string;

    public accessToken: string;

    private idToken: string;

    public tokenResponse: any;

    private readonly environment: string;

    private readonly apiScopes: string[];

    private readonly clientId: string;

   private currentDomainTenant: string;

   public account: AccountInfo;

   public seed: number;

   static instance: any;

    public msalLibrary = {
      setNavigationClient(navigationClient: string) {
        return navigationClient;
      },
    }

    constructor() {
      this.tenantId = 'c400f50d-7a56-4ef2-8e44-211bfa434724';
      this.environment = 'login.windows.net';
      this.apiScopes = ['https://crctechmain.onmicrosoft.com/emis-dev/api/api_access'];
      this.clientId = '44dc9a29-39d1-462e-9cbe-b9507b34396d';
      this.account = null;
    }

    // TODO EMISV2-3479 Use Azure Key Vault?
    async fetchToken(userName: string, password: string): Promise<string> {
      const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('client_id', this.clientId);
      params.append('client_secret', 'VwNQd7XbIYrV7stj58oiaKKHKphkjiw7KS');
      params.append('username', userName);
      params.append('password', password);
      params.append('scope', ['openid profile email'].concat(this.apiScopes).join(' '));
      params.append('resource', '44dc9a29-39d1-462e-9cbe-b9507b34396d');

      try {
        const res = await axios.post(`https://login.microsoftonline.com/${this.tenantId}/oauth2/token`, params, { headers });
        return res.data;
      } catch (e) {
        return null;
      }
    }

    // TODO EMISV2-3479 Use Azure Key Vault?
    getCredentials(as: UserRoles) {
      switch (as) {
        case UserRoles.level6: {
          return {
            userName: 'testsix@crctechmain.onmicrosoft.com',
            password: 'QAEMIS1!',
          };
        }
        default: {
          return {
            userName: 'testsix@crctechmain.onmicrosoft.com',
            password: 'QAEMIS1!',
          };
        }
      }
    }

    async signIn(as: UserRoles) {
      const { userName, password } = this.getCredentials(as);
      this.tokenResponse = await this.fetchToken(userName, password);
      this.accessToken = this.tokenResponse.access_token;
      this.account = this.buildAccountInfo();
    }

    getInjectTokens(): ITokens {
      const tokenResponse = this.tokenResponse;
      const idToken: JwtPayload = decode(tokenResponse.id_token) as JwtPayload;
      const localAccountId = idToken.oid || idToken.sid;
      const realm = idToken.tid;
      const homeAccountId = `${localAccountId}.${realm}`;
      const username = idToken.preferred_username;
      const name = idToken.name;

      const accountKey = `${homeAccountId}-${this.environment}-${realm}`;
      const accountEntity = this.buildAccountEntity(homeAccountId, realm, localAccountId, username, name);

      const accessTokenKey = `${homeAccountId}-${this.environment}-accesstoken-${this.clientId}-${realm}-${this.apiScopes.join(
        ' ',
      )}`;
      const accessTokenEntity = this.buildAccessTokenEntity({
        homeAccountId,
        accessToken: tokenResponse.access_token,
        expiresIn: tokenResponse.expires_in,
        extExpiresIn: tokenResponse.ext_expires_in,
        realm,
        scopes: this.apiScopes,
      });

      const idTokenKey = `${homeAccountId}-${this.environment}-idtoken-${this.clientId}-${realm}-`;
      const idTokenEntity = this.buildIdTokenEntity(homeAccountId, tokenResponse.id_token, realm);

      return {
        accountKey,
        accountEntity,
        accessTokenKey,
        accessTokenEntity,
        idTokenKey,
        idTokenEntity,
      };
    }

    buildAccountInfo(): AccountInfo {
      const idToken: JwtPayload = decode(this.tokenResponse.id_token) as JwtPayload;
      const localAccountId = idToken.oid || idToken.sid;
      const realm = idToken.tid;
      const homeAccountId = `${localAccountId}.${realm}`;
      const username = idToken.preferred_username;
      const name = idToken.name;

      return {
        homeAccountId,
        environment: this.environment,
        tenantId: this.tenantId,
        username,
        localAccountId,
        name,
        idTokenClaims: idToken,
      };
    }

    buildAccessTokenEntity({
      homeAccountId, accessToken, expiresIn, extExpiresIn, realm, scopes,
    }: {
      homeAccountId: string,
      accessToken: string,
      expiresIn: number,
      extExpiresIn: number,
      realm: string,
      scopes: string[],
    }) {
      const now = Math.floor(Date.now() / 1000);
      return {
        homeAccountId,
        credentialType: 'AccessToken',
        secret: accessToken,
        cachedAt: now.toString(),
        expiresOn: (now + expiresIn).toString(),
        extendedExpiresOn: (now + extExpiresIn).toString(),
        environment: this.environment,
        clientId: this.clientId,
        realm,
        target: scopes.map((s: string) => s.toLowerCase()).join(' '),
      // Scopes _must_ be lowercase or the token won't be found
      };
    }

    buildIdTokenEntity(homeAccountId: string, idToken: string, realm: string) {
      return {
        credentialType: 'IdToken',
        homeAccountId,
        environment: this.environment,
        clientId: this.clientId,
        secret: idToken,
        realm,
      };
    }

    // eslint-disable-next-line max-params
    buildAccountEntity(
      homeAccountId: string,
      realm: string,
      localAccountId: string,
      username: string,
      name: string,
    ) {
      return {
        authorityType: 'MSSTS',
        // This could be filled in but it involves a bit of custom base64 encoding
        // and would make this sample more complicated.
        // This value does not seem to get used, so we can leave it out.
        clientInfo: '',
        homeAccountId,
        environment: this.environment,
        realm,
        localAccountId,
        username,
        name,
      };
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
      return true
    }
}
