import { AccountInfo } from '@azure/msal-browser';
import { decode, JwtPayload } from 'jsonwebtoken';
import { TokenClaims, ServerAuthorizationTokenResponse } from '@azure/msal-common';
import { localStorageKeys } from '@libs/shared-lib/constants/localStorage';

export interface ITokens {
  accountKey: string,
  accountEntity: Record<string, unknown>,
  accessTokenKey: string,
  accessTokenEntity: Record<string, unknown>,
  idTokenKey: string,
  idTokenEntity: Record<string, unknown>,
}

export enum UserRoles {
  'noAccess' = 'noAccess',
  'level0' = 'level0',
  'level1' = 'level1',
  'level2' = 'level2',
  'level3' = 'level3',
  'level4' = 'level4',
  'level5' = 'level5',
  'level6' = 'level6',
  'contributor1' = 'contributorIM',
  'contributor2' = 'contributorFinance',
  'contributor3' = 'contributor3',
  'readonly' = 'readonly',
  'no_role' = 'no_role',
}

export const getCredentials = (as: UserRoles) => {
  const map = {
    [UserRoles.level6]: {
      username: Cypress.env('USER_6_MAIL'),
      password: Cypress.env('USER_6_PASSWORD'),
    },
    [UserRoles.level5]: {
      username: Cypress.env('USER_5_MAIL'),
      password: Cypress.env('USER_5_PASSWORD'),
    },
    [UserRoles.level4]: {
      username: Cypress.env('USER_4_MAIL'),
      password: Cypress.env('USER_4_PASSWORD'),
    },
    [UserRoles.level3]: {
      username: Cypress.env('USER_3_MAIL'),
      password: Cypress.env('USER_3_PASSWORD'),
    },
    [UserRoles.level2]: {
      username: Cypress.env('USER_2_MAIL'),
      password: Cypress.env('USER_2_PASSWORD'),
    },
    [UserRoles.level1]: {
      username: Cypress.env('USER_1_MAIL'),
      password: Cypress.env('USER_1_PASSWORD'),
    },
    [UserRoles.level0]: {
      username: Cypress.env('USER_0_MAIL'),
      password: Cypress.env('USER_0_PASSWORD'),
    },
    [UserRoles.no_role]: {
      username: Cypress.env('USER_NO_ROLE_MAIL'),
      password: Cypress.env('USER_NO_ROLE_PASSWORD'),
    },
    [UserRoles.contributor1]: {
      username: Cypress.env('CONTRIBUTOR1_EMAIL'),
      password: Cypress.env('CONTRIBUTOR1_PASSWORD'),
    },
    [UserRoles.contributor2]: {
      username: Cypress.env('CONTRIBUTOR2_EMAIL'),
      password: Cypress.env('CONTRIBUTOR2_PASSWORD'),
    },
    [UserRoles.contributor3]: {
      username: Cypress.env('CONTRIBUTOR3_EMAIL'),
      password: Cypress.env('CONTRIBUTOR3_PASSWORD'),
    },
    [UserRoles.readonly]: {
      username: Cypress.env('USER_READ_ONLY'),
      password: Cypress.env('USER_READ_ONLY_PASSWORD'),
    },
  } as Record<UserRoles, { username: string; password: string }>;
  return map[as];
};

export const buildAccountInfo = (tokenResponse: ServerAuthorizationTokenResponse): AccountInfo => {
  const useIdentityServer = !!Cypress.env('USE_IDS'); // FeatureKeys.UseIdentityServer
  const environment = useIdentityServer ? 'ids.crc-tech.ca' : 'login.windows.net';
  const tenantId = Cypress.env('AZURE_TENANT_ID');
  const idToken = decode(tokenResponse.id_token) as TokenClaims;
  const localAccountId = idToken.oid || idToken.sid;
  const realm = idToken.tid;
  const homeAccountId = `${localAccountId}.${realm}`;
  const username = idToken.preferred_username;
  const { name } = idToken;

  return {
    homeAccountId,
    environment,
    tenantId,
    username,
    localAccountId,
    name,
    idTokenClaims: idToken,
  };
};

const buildAccountEntity = (
  authorityType: string,
  environment: string,
  homeAccountId: string,
  realm: string,
  localAccountId: string,
  username: string,
  name: string,
  // eslint-disable-next-line max-params
) => ({
  authorityType,
  clientInfo: '',
  homeAccountId,
  environment,
  realm,
  localAccountId,
  username,
  name,
});

const buildAccessTokenEntity = ({
  environment, clientId, homeAccountId, accessToken, expiresIn, extExpiresIn, realm, scopes,
}: {
    environment: string,
    clientId: string,
    homeAccountId: string,
    accessToken: string,
    expiresIn: number,
    extExpiresIn: number,
    realm: string,
    scopes: string[],
}) => {
  const now = Math.floor(Date.now() / 1000);
  return {
    homeAccountId,
    credentialType: 'AccessToken',
    secret: accessToken,
    cachedAt: now.toString(),
    expiresOn: (now + expiresIn).toString(),
    extendedExpiresOn: (now + extExpiresIn).toString(),
    environment,
    clientId,
    realm,
    target: scopes.map((s: string) => s.toLowerCase()).join(' '),
    // Scopes _must_ be lowercase or the token won't be found
  };
};

const buildIdTokenEntity = ({
  environment, clientId, homeAccountId, idToken, realm,
}: {
  environment: string,
  clientId: string,
  homeAccountId: string,
  idToken: string,
  realm: string,
}) => ({
    credentialType: 'IdToken',
    homeAccountId,
    environment,
    clientId,
    secret: idToken,
    realm,
  });

export const getInjectTokens = (tokenResponse: ServerAuthorizationTokenResponse): ITokens => {
  const useIdentityServer = !!Cypress.env('USE_IDS'); // FeatureKeys.UseIdentityServer
  // environment: could parse the token issuer, but this shouldn't be necessary
  const environment = useIdentityServer ? 'ids.crc-tech.ca' : 'login.windows.net';
  const authorityType = useIdentityServer ? 'Generic' : 'MSSTS';
  const clientId = useIdentityServer ? 'cypress' : Cypress.env('AZURE_CLIENT_ID');
  const apiScopes = (useIdentityServer ? [Cypress.env('IDS_API_SCOPES')] : [Cypress.env('MSAL_API_SCOPES')]) as Array<string>;
  const idToken: JwtPayload = decode(tokenResponse.id_token) as JwtPayload;
  const localAccountId = idToken.oid || idToken.sid;
  const realm = idToken.tid;
  const homeAccountId = `${localAccountId}.${realm}`;
  const username = idToken.preferred_username;
  const { name } = idToken;

  const accountKey = `${homeAccountId}-${environment}-${realm}`;
  const accountEntity = buildAccountEntity(authorityType, environment, homeAccountId, realm, localAccountId, username, name);

  const accessTokenKey = `${homeAccountId}-${environment}-accesstoken-${clientId}-${realm}-${apiScopes.join(' ')}`;
  const accessTokenEntity = buildAccessTokenEntity({
    environment,
    clientId,
    homeAccountId,
    accessToken: tokenResponse.access_token,
    expiresIn: tokenResponse.expires_in,
    extExpiresIn: tokenResponse.ext_expires_in,
    realm,
    scopes: apiScopes,
  });

  const idTokenKey = `${homeAccountId}-${environment}-idtoken-${clientId}-${realm}-`;
  const idTokenEntity = buildIdTokenEntity({ environment, clientId, homeAccountId, idToken: tokenResponse.id_token, realm });

  return {
    accountKey,
    accountEntity,
    accessTokenKey,
    accessTokenEntity,
    idTokenKey,
    idTokenEntity,
  };
};

const getTokenIDS = (as = UserRoles.level6, retries = 5, waitTime = 2000) => {
  const { username } = getCredentials(as as UserRoles);

  const requestToken = (retryCount: number, wait: number): Cypress.Chainable<ServerAuthorizationTokenResponse> => cy.request({
      method: 'POST',
      url: Cypress.env('IDS_TOKEN_ENDPOINT'),
      form: true,
      failOnStatusCode: false,
      body: {
        grant_type: 'client_credentials_impersonation',
        client_id: 'cypress',
        client_secret: Cypress.env('IDS_CLIENT_SECRET'),
        scope: ['openid profile email emisid'].concat(Cypress.env('IDS_API_SCOPES')).join(' '),
        username,
        tid: Cypress.env('AZURE_TENANT_ID'),
      },
    }).then((response) => {
      if (response.status === 200) {
        const tokenResponse = response.body as ServerAuthorizationTokenResponse;
        tokenResponse.id_token = tokenResponse.access_token;
        return cy.wrap(tokenResponse);
      } if (retryCount < retries) {
        cy.wait(wait);
        return requestToken(retryCount + 1, wait * 2);
      }
        throw new Error(`Failed to get token after ${retries} retries`);
    });

  return requestToken(0, waitTime);
};

const getTokenAD = (as = UserRoles.level6) => {
  const { username, password } = getCredentials(as as UserRoles);
  cy.request({
    method: 'POST',
    url: `https://login.microsoftonline.com/${Cypress.env(
      'AZURE_TENANT_ID',
    )}/oauth2/v2.0/token`,
    form: true,
    body: {
      grant_type: 'password',
      client_id: Cypress.env('AZURE_CLIENT_ID'),
      client_secret: Cypress.env('AZURE_CLIENT_SECRET'),
      scope: ['openid profile email'].concat(Cypress.env('MSAL_API_SCOPES')).join(' '),
      username,
      password,
    },
  }).then((response) => {
    const tokenResponse = response.body as ServerAuthorizationTokenResponse;
    return tokenResponse;
  });
};

Cypress.Commands.add('getToken', (as = UserRoles.level6) => {
  const useIdentityServer = !!Cypress.env('USE_IDS');
  if (useIdentityServer) {
    return getTokenIDS(as);
  }

    return getTokenAD(as);
});

Cypress.Commands.add('login', (as = UserRoles.level6) => {
  cy.getToken(as).then((tokenResponse: ServerAuthorizationTokenResponse) => {
    const account = buildAccountInfo(tokenResponse);
    localStorage.setItem(localStorageKeys.automatedTests.name, 'true');
    localStorage.setItem(localStorageKeys.accessToken.name, tokenResponse.access_token);
    localStorage.setItem(localStorageKeys.msalAccount.name, JSON.stringify(account));

    const tokens = getInjectTokens(tokenResponse);
    localStorage.setItem(tokens.accountKey, JSON.stringify(tokens.accountEntity));
    localStorage.setItem(tokens.idTokenKey, JSON.stringify(tokens.idTokenEntity));
    localStorage.setItem(tokens.accessTokenKey, JSON.stringify(tokens.accessTokenKey));

    return tokenResponse;
  });
});

Cypress.Commands.add('loginProd', () => {
  cy.request({
    method: 'POST',
    url: `https://login.microsoftonline.com/${Cypress.env('AZURE_TENANT_ID_PROD')}/oauth2/v2.0/token`,
    form: true,
    body: {
      grant_type: 'password',
      client_id: Cypress.env('AZURE_CLIENT_ID_PROD'),
      client_secret: Cypress.env('AZURE_CLIENT_SECRET_PROD'),
      scope: ['openid profile email'].concat(Cypress.env('MSAL_API_SCOPES_PROD')).join(' '),
      username: Cypress.env('USER_PROD'),
      password: Cypress.env('USER_PROD_PASSWORD'),
    },
  }).then((response) => {
    const tokenResponse = response.body as ServerAuthorizationTokenResponse;
    const account = buildAccountInfo(tokenResponse);
    localStorage.setItem(localStorageKeys.automatedTests.name, 'true');
    localStorage.setItem(localStorageKeys.accessToken.name, tokenResponse.access_token);
    localStorage.setItem(localStorageKeys.msalAccount.name, JSON.stringify(account));

    const tokens = getInjectTokens(tokenResponse);
    localStorage.setItem(tokens.accountKey, JSON.stringify(tokens.accountEntity));
    localStorage.setItem(tokens.idTokenKey, JSON.stringify(tokens.idTokenEntity));
    localStorage.setItem(tokens.accessTokenKey, JSON.stringify(tokens.accessTokenKey));
    return tokenResponse;
  });
});
