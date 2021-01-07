import { IAuthenticationsServiceMock } from '@/services/authentications/authentications.types';
import { authenticationResponseData } from '@/entities/authentication';

export const mockAuthenticationsService = (): IAuthenticationsServiceMock => ({

  signIn: jest.fn(async () => ({
    success: true,
    status: 200,
    statusText: 'OK',
    data: {
      authenticationResponseData,
    },
  })),

  isSignedIn: jest.fn(async () => true),

  getAuthenticationAccount: jest.fn(async () => ({
    accountIdentifier: '',
    environment: '',
    homeAccountIdentifier: '',
    idToken: {},
    idTokenClaims: {
      oid: authenticationResponseData.userId,
      given_name: authenticationResponseData.firstName,
      family_name: authenticationResponseData.lastName,
      email: authenticationResponseData.email,
    },
    name: '',
    sid: '',
    userName: '',
  })),

  getAccessToken: jest.fn(async () => ({
    accessToken: '123456',
    rawIdToken: '123456',
    idTokenExpiresOn: null,
    account: null,
  })),

  signOut: jest.fn(async () => true),
});
