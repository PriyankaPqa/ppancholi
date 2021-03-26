export enum EFilterKey {
  CaseNotes = 1,
  CaseFiles = 2,
  Events = 3,
  ApprovalTemplates = 4,
  Referrals = 5,
  ApprovalTables = 6,
  Beneficiaries = 7,
  FinancialAssistanceTables = 8,
  EventPrograms = 9,
  FinancialAssistanceTemplates = 10,
  Teams = 11,
}

export interface IFilter {
  name: string;
  filterKey: EFilterKey;
  criteria: (string|number)[][];
}

export interface IFilterData {
  name: string;
  filterKey: EFilterKey;
  criteria: string[];
}

export interface IUserAccountData {
  id: uuid;
  tenantId: uuid;
  created: string;
  timestamp: string;
  status: 1 | 2;
  eTag: string;
  filters: IFilter[]
}

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

export interface IUserData extends IMSALUserData{
  filters?: IFilter[]
}

export interface IUser {
  readonly id: uuid;
  readonly email: string;
  readonly lastName: string;
  readonly firstName: string;
  readonly roles: Array<string>;
  readonly filters: Array<IFilter>;
  getFullName(): string;
  getInitials(): string;
  hasRole(role: string): boolean;
  hasLevel(level: string): boolean;
}
