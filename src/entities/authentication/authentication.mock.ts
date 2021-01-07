import { IAuthenticationAccessToken } from '@/types';

export const authenticationResponseData: IAuthenticationAccessToken = {
  accessToken: '...',
  account: {
    accountIdentifier: '...',
    homeAccountIdentifier: '...',
    userName: 'test@redcross.ca',
    name: 'John Smith',
    sid: 'adfasdf',
    idToken: null,
    idTokenClaims: {
      oid: '1',
      family_name: 'Smith',
      given_name: 'John',
      email: 'test@redcross.ca',
      roles: ['level6'],
    },
    environment: '...',
  },
  rawIdToken: '...',
  idTokenExpiresOn: new Date(),
};
