import { IListOption, IMultilingual } from '@libs/shared-lib/types';

import { IEntity, IEntityCombined } from '../base';

export enum FilterKey {
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
  CaseFileFinancialAssistanceOverview = 12,
  MassActionFinancialAssistance = 13,
  MassActionImpactStatuses = 14,
  Documents = 15,
  AssessmentForms = 16,
  AssessmentTemplates = 17,
  ApprovalRequests = 18,
  MassActionAssessment = 19,
  MassActionCaseFileStatus = 21,
}

export type AccessLevels = 0 | 1 | 2 | 4 | 8 | 16 | 32 | 48 | 56 | 60 | 62 | 63 | 64 | 128 | 256 | 448 | 512;

export interface IFilter {
  readonly name?: string;
  filterKey?: FilterKey;
  readonly criteria?: Array<string>;
}

export enum AccountStatus {
  None = 0,
  Active = 1,
  Inactive = 2,
}

export interface IUserAccountTeamEvent {
  id?:string,
  name: IMultilingual;
}

export interface IUserAccountTeam {
  teamId: string;
  name: string;
  teamTypeName: IMultilingual;
  events: Array<IUserAccountTeamEvent>;
}

export interface IAssignedCaseFileCountByTeam {
  teamId: string;
  openCaseFileCount: number;
  closedCaseFileCount: number;
  inactiveCaseFileCount: number;
  allCaseFileCount: number;
}

export interface IUserAccountEntity extends IEntity {
  filters?: Array<IFilter>;
  roles?: Array<IListOption>;
  accessLevels?: AccessLevels;
  accountStatus?: AccountStatus;
}

export interface IUserAccountMetadata extends IEntity {
  displayName?: string;
  emailAddress?: string;
  phoneNumber?: string;
  roleId?: string;
  roleName?: IMultilingual;
  teamCount?: number;
  teams?: Array<IUserAccountTeam>;
  preferredLanguage?: string;
  givenName?: string;
  surname?: string;
  userPrincipalName?: string;
  assignedCaseFileCountByTeam: IAssignedCaseFileCountByTeam[]
}

export type IUserAccountCombined = IEntityCombined<IUserAccountEntity, IUserAccountMetadata>;

export type IdParams = uuid;
