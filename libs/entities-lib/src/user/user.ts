import { IUser, IUserData, UserRoles } from './user.types';

export class User implements IUser {
  readonly id: string;

  readonly email: string;

  readonly lastName: string;

  readonly firstName: string;

  readonly roles: Array<UserRoles>;

  readonly homeAccountId: string;

  constructor(data: IUserData) {
    this.id = data.oid;
    this.email = data.email;
    this.lastName = data.family_name;
    this.firstName = data.given_name;
    this.roles = data?.roles?.length ? [...data.roles] : [UserRoles.no_role];
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

  hasRole(role: UserRoles): boolean {
    const acceptedValues = Object.keys(UserRoles);

    if (typeof role !== 'string') {
      throw new Error(`The function $hasRole is expecting a string. A ${typeof role} was passed`);
    }

    if (acceptedValues.indexOf(role) === -1) {
      throw new Error(`The role ${role} is not valid. Please choose among ${acceptedValues.join(', ')}`);
    }
    if (this.roles) {
      return this.roles.some((r: UserRoles) => r.toLowerCase() === role.toLowerCase());
    }
    return false;
  }

  currentRole(): UserRoles {
    return this.roles[0];
  }

  // hasHigherLevelOrSameAs - strict Level is to check for an exact Level, not something included in another level
  hasLevel(levelToCheck: UserRoles, strictLevel = false): boolean {
    // Index n + 1, inherit from index [0,n]
    const hierarchy = [UserRoles.level0, UserRoles.level1, UserRoles.level2,
      UserRoles.level3, UserRoles.level4, UserRoles.level5, UserRoles.level6];
    const userHasALevel = hierarchy.indexOf(this.currentRole());

    if (userHasALevel === -1) {
      return false;
    }

    const levelToCheckIndex = hierarchy.indexOf(levelToCheck);

    if (levelToCheckIndex === -1) {
      return false;
    }

    let highestUserLevel = -1;

    this.roles.forEach((r) => {
      const index = hierarchy.indexOf(r);
      if (index > highestUserLevel) {
        highestUserLevel = index;
      }
    });
    return strictLevel ? levelToCheckIndex === highestUserLevel : levelToCheckIndex <= highestUserLevel;
  }
}
