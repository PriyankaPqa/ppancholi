import { IAuthenticationAccessToken, IRestResponse } from '@/types';

export interface IAuthenticationsService {
  signIn(): Promise<IRestResponse>;
  signOut(): Promise<void>;
  isSignedIn(): Promise<boolean>;
  getAccessToken(): Promise<IAuthenticationAccessToken>;
}

export interface IAuthenticationsServiceMock {
  signIn: jest.Mock <Promise<IRestResponse>>;
  isSignedIn: jest.Mock <Promise<boolean>>;
  getAccessToken: jest.Mock <Promise<IAuthenticationAccessToken>>;
  signOut: jest.Mock <Promise<boolean>>;
}
