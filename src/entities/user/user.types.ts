export interface IUserData {
   oid: string;
   email: string;
  // eslint-disable-next-line camelcase
   family_name: string;
  // eslint-disable-next-line camelcase
   given_name: string;
   roles: Array<string>;
}

export interface IUser {
  readonly id: string;
  readonly email: string;
  readonly lastName: string;
  readonly firstName: string;
  readonly roles: Array<string>;
  getFullName(): string;
  getInitials(): string;
}
