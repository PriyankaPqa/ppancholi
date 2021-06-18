// Coming from MSAL
export interface IMSALUserData {
   oid: uuid;
   email?: string;
  // eslint-disable-next-line camelcase
   family_name: string;
  // eslint-disable-next-line camelcase
   given_name: string;
   roles: Array<string>;
  // eslint-disable-next-line camelcase
   preferred_username?: string;
}

export interface IUserData extends IMSALUserData{}

export interface IUser {
  readonly id: uuid;
  readonly email: string;
  readonly lastName: string;
  readonly firstName: string;
  readonly roles: Array<string>;
  getFullName(): string;
  getInitials(): string;
  hasRole(role: string): boolean;
  hasLevel(level: string): boolean;
}
