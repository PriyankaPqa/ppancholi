import { Account } from 'msal';

export interface IAuthenticationAccessToken {
  accessToken: string,
  rawIdToken: string,
  idTokenExpiresOn: Date,
  account: Account,
}
