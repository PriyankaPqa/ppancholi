import { IAuthenticationAccessToken } from '@/types';

export const mockAuthenticationData = (): IAuthenticationAccessToken => ({
  accessToken: '...',
  account: {
    homeAccountId: '...',
    environment: '...',
    tenantId: '...',
    username: 'test@redcross.ca',
    localAccountId: '...',
    name: 'John Smith',
    idTokenClaims: {
      oid: '1',
      family_name: 'Smith',
      given_name: 'John',
      email: 'test@redcross.ca',
      roles: ['level6'],
    },
  },
  idToken: '...',
  idTokenExpiresOn: new Date(),
});
