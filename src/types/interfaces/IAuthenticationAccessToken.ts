import { Account as MsalAccount } from 'msal';

interface Account extends Omit<MsalAccount, 'idTokenClaims'> {
  idTokenClaims: Record<string, string | string[]>;
}

export interface IAuthenticationAccessToken {
  accessToken: string,
  account: Account,
  rawIdToken: string,
  idTokenExpiresOn: Date,
}
