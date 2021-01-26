import { mockAuthenticationData } from '@/auth/authentication.mock';

export default {
  signIn: jest.fn(),

  signOut: jest.fn(),

  isSignedIn: jest.fn(),

  acquireToken: jest.fn(async () => ({ ...mockAuthenticationData() })),
};
