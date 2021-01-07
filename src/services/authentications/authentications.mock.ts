import { IAuthenticationsServiceMock } from '@/services/authentications/authentications.types';
import { authenticationResponseData } from '@/entities/authentication';

export const mockAuthenticationsService = (): IAuthenticationsServiceMock => ({
  signIn: jest.fn(async () => ({
    success: true,
    status: 200,
    statusText: 'OK',
    data: null,
  })),

  signOut: jest.fn(async () => true),

  isSignedIn: jest.fn(async () => true),

  getAccessToken: jest.fn(async () => ({ ...authenticationResponseData })),
});
