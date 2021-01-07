import { Account } from 'msal';

export interface IAuthenticationAccessToken {
  accessToken: string,
  account: Account,
  rawIdToken: string,
  idTokenExpiresOn: Date,
}
