export interface IUserData {
   oid: string;
   email?: string;
  // eslint-disable-next-line camelcase
   family_name: string;
  // eslint-disable-next-line camelcase
   given_name: string;
   roles: Array<string>;
  // eslint-disable-next-line camelcase
   preferred_username?: string;
}

export interface IUser {
  readonly id: string;
  readonly email: string;
  readonly lastName: string;
  readonly firstName: string;
  readonly roles: Array<string>;
  getFullName(): string;
  getInitials(): string;
  hasRole(role: string): boolean;
  hasLevel(level: string): boolean;
}
