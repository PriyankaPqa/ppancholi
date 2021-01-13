import { authenticationResponseData } from '@/entities/authentication';

export default {
  signIn: jest.fn(),

  signOut: jest.fn(),

  isSignedIn: jest.fn(),

  acquireToken: jest.fn(async () => ({ ...authenticationResponseData })),
};
