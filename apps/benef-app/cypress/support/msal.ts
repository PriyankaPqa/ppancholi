export enum UserRoles {
    'noAccess' = 'noAccess',
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

Cypress.Commands.add('getToken', (as = UserRoles.level6) => {
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
    const tokenResponse = response.body;
    cy.wrap(tokenResponse.access_token).as('accessToken').then(() => tokenResponse);
  });
});
