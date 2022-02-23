import { IUser, IUserData } from './user.types';

export const NO_ROLE = 'no_role';

export enum UserRoles {
  'noAccess' = 'noAccess',
  'level1'='level1',
  'level2'='level2',
  'level3'= 'level3',
  'level4'='level4',
  'level5'='level5',
  'level6'='level6',
  'contributorIM'='contributorIM',
  'contributorFinance'='contributorFinance',
  'contributor3'='contributor3',
  'readonly'='readonly',
  'no_role'='no_role'
}

export class User implements IUser {
  readonly id: string;

  readonly email: string;

  readonly lastName: string;

  readonly firstName: string;

  readonly roles: Array<string>;

  readonly homeAccountId: string;

  constructor(data: IUserData) {
    this.id = data.oid;
    this.email = data.email;
    this.lastName = data.family_name;
    this.firstName = data.given_name;
    this.roles = data?.roles ? data.roles : [NO_ROLE];
    this.homeAccountId = data.homeAccountId;
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
    const acceptedValues = Object.keys(UserRoles);

    if (typeof role !== 'string') {
      throw new Error(`The function $hasRole is expecting a string. A ${typeof role} was passed`);
    }

    if (acceptedValues.indexOf(role) === -1) {
      throw new Error(`The role ${role} is not valid. Please choose among ${acceptedValues.join(', ')}`);
    }
    if (this.roles) {
      return this.roles.some((r: string) => r.toLowerCase() === role.toLowerCase());
    }
    return false;
  }

  currentRole(): string {
    return this.roles[0];
  }

  // hasHigherLevelOrSameAs
  hasLevel(levelToCheck: string): boolean {
    // Index n + 1, inherit from index [0,n]
    const hierarchy = ['level1', 'level2', 'level3', 'level4', 'level5', 'level6'];
    const userHasALevel = hierarchy.indexOf(this.currentRole());

    if (userHasALevel === -1) {
      return false;
    }

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
