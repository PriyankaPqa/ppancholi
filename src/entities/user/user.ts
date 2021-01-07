import { IUser, IUserData } from './user.types';

export class User implements IUser {
  readonly id: string;

  readonly email: string;

  readonly lastName: string;

  readonly firstName: string;

  readonly roles: Array<string>;

  constructor(data: IUserData) {
    this.id = data.oid;
    this.email = data.email;
    this.lastName = data.family_name;
    this.firstName = data.given_name;
    this.roles = data.roles;
  }

  getFullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return '';
  }

  getInitials(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName.substring(0, 1)}${this.lastName.substring(0, 1)}`.toUpperCase();
    }
    return '';
  }
}
