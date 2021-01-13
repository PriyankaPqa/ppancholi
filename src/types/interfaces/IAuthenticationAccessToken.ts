import { AccountInfo } from '@azure/msal-browser';

interface Account extends Omit<AccountInfo, 'idTokenClaims'> {
  idTokenClaims: Record<string, string | string[]>;
}

export interface IAuthenticationAccessToken {
  accessToken: string,
  account: Account,
  idToken: string,
  idTokenExpiresOn: Date,
}
