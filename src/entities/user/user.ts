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

  hasRole(role: string): boolean {
    if (typeof role !== 'string') {
      throw new Error(`The function $hasRole is expecting a string. A ${typeof role} was passed`);
    }
    return this.roles.some((r: string) => r.toLowerCase() === role.toLowerCase());
  }

  // hasHigherLevelOrSameAs
  hasLevel(levelToCheck: string): boolean {
    // Index n + 1, inherit from index [0,n]
    const hierarchy = ['level1', 'level2', 'level3', 'level4', 'level5', 'level6'];
    const levelToCheckIndex = hierarchy.indexOf(levelToCheck);

    if (levelToCheckIndex === -1) {
      return false;
    }

    let highestUserLevel = 0;

    this.roles.forEach((r) => {
      const index = hierarchy.indexOf(r);
      if (index > highestUserLevel) {
        highestUserLevel = index;
      }
    });

    return levelToCheckIndex <= highestUserLevel;
  }
}
