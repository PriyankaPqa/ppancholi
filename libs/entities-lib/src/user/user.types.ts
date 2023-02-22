export enum UserRoles {
  'noAccess' = 'noAccess',
  'level0' = 'level0',
  'level1' = 'level1',
  'level2' = 'level2',
  'level3' = 'level3',
  'level4' = 'level4',
  'level5' = 'level5',
  'level6' = 'level6',
  'contributorIM' = 'contributorIM',
  'contributorFinance' = 'contributorFinance',
  'contributor3' = 'contributor3',
  'readonly' = 'readonly',
  'no_role' = 'no_role',
}

export enum UserRolesNames {
  'noAccess' = 'No Access',
  'level0' = 'Level 0',
  'level1' = 'Level 1',
  'level2' = 'Level 2',
  'level3' = 'Level 3',
  'level4' = 'Level 4',
  'level5' = 'Level 5',
  'level6' = 'Level 6',
  'contributorIM' = 'ContributorIM',
  'contributorFinance' = 'ContributorFinance',
  'contributor3' = 'ContributorAdvisor',
  'readonly' = 'Read Only',
  'no_access' = 'No Access',
}

// Coming from MSAL
export interface IMSALUserData {
  oid: string;
  email?: string;
  // eslint-disable-next-line camelcase
  family_name: string;
  // eslint-disable-next-line camelcase
  given_name: string;
  roles: Array<UserRoles>;
  // eslint-disable-next-line camelcase
  preferred_username?: string;
  homeAccountId: string;
}

export interface IUserData extends IMSALUserData {}

export interface IUser {
  readonly id: string;
  readonly email: string;
  readonly lastName: string;
  readonly firstName: string;
  readonly homeAccountId: string;
  readonly roles: Array<UserRoles>;
  getFullName(): string;
  getInitials(): string;
  hasRole(role: string): boolean;
  hasLevel(level: string): boolean;
}
