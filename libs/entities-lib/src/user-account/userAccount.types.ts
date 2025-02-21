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
  Tasks = 20,
  MassActionCaseFileStatus = 21,
  MassActionCommunication = 22,
  Appointment = 23,
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
  Pending = 3,
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

export interface IUserProfileData {
  id: uuid;
  displayName?: string;
  emailAddress?: string;
  preferredLanguage?: string;
  givenName?: string;
  surname?: string;
  userPrincipalName?: string;
  phoneNumber?: string;
}

export interface IRolesData {
  id: uuid;
  displayName: string;
  value: string;
}

export interface IUserAccountEntity extends IEntity {
  /* These properties are not yet fully filled on new users.  lets say they dont exists.  Use metadata instead */
  // displayName?: string;
  // emailAddress?: string;
  // preferredLanguage?: string;
  // givenName?: string;
  // surname?: string;
  // userPrincipalName?: string;
  // phoneNumber?: string;
  filters?: Array<IFilter>;
  roles?: Array<IListOption>;
  accessLevels?: AccessLevels;
  accountStatus?: AccountStatus;
}

export interface IUserAccountMetadata extends IEntity, IUserProfileData {
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
  assignedCaseFileCountByTeam?: IAssignedCaseFileCountByTeam[]
}

export interface IUserProfileQueryResponse extends IUserProfileData {
  existsInEmis?: boolean;
}

export interface UserTeamMember {
  roleName: IMultilingual,
  displayName: string,
  id: string,
  emailAddress: string,
}

export type IUserAccountCombined = IEntityCombined<IUserAccountEntity, IUserAccountMetadata>;

export type IdParams = uuid;
