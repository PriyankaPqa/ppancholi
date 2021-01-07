import { IAuthenticationAccessToken, IRestResponse } from '@/types';
import { Account } from 'msal';

export interface IAuthenticationsService {
  signIn(): Promise<IRestResponse>;
  signOut(): Promise<void>;
  getAuthenticationAccount(): Promise<Account>;
  isSignedIn(): Promise<boolean>;
  getAccessToken(): Promise<IAuthenticationAccessToken>;
}

export interface IAuthenticationsServiceMock {
  signIn: jest.Mock <Promise<IRestResponse>>;
  getAuthenticationAccount: jest.Mock <Promise<Account>>;
  isSignedIn: jest.Mock <Promise<boolean>>;
  getAccessToken: jest.Mock <Promise<IAuthenticationAccessToken>>;
  signOut: jest.Mock <Promise<boolean>>;
}
