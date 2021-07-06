import { IMultilingual, IListOption, IIdMultilingualName } from '@/types';
import { IEntity, IEntityCombined } from '@/entities/base/base.types';

/**
 * Enums
 */

export enum CaseFileStatus {
  Inactive = 1,
  Open = 2,
  Closed = 3,
  Archived = 4,
}

export enum CaseFileTriage {
  None = 0,
  Tier1 = 1,
  Tier2 = 2,
  Tier3 = 3,
  Tier4 = 4,
  Tier5 = 5,
}

export enum CaseFileActivityType {
  AddedTag = 1,
  RemovedTag = 2,
  AddedDuplicateFlag = 3,
  RemovedDuplicateFlag = 4,
  CaseFileStatusDeactivated = 5,
  CaseFileStatusClosed = 6,
  CaseFileStatusArchived = 7,
  CaseFileStatusReopened = 8,
  TriageUpdated = 9,
  AssignedToCaseFile = 10,
  UnassignedFromCaseFile = 11,
  IdentityAuthenticationUpdated = 12,
  ImpactStatusValidationUpdated = 13,
}

export enum IdentityAuthenticationStatus
{
  NotVerified = 0,
  Passed = 1,
  Failed = 2,
}

export enum ValidationOfImpactStatus
{
    Undetermined = 0,
    Impacted = 1,
    NotImpacted = 2
}
/**
 * Interfaces
 */

export interface ICaseFileHouseholdPhoneNumber {
  number: string;
  extension: string;
}

export interface ICaseFileLabel {
  order: number;
  name: string;
}

export interface ICaseFileActivityUser {
  id: string;
  name: string;
}

export interface ICaseFileActivity {
  id: uuid;
  caseFileId: uuid;
  user: ICaseFileActivityUser;
  role: IIdMultilingualName;
  created: Date | string;
  activityType: CaseFileActivityType;
  details: Record<string, unknown>;
}

export interface ICaseFileEntity extends IEntity {
  assignedIndividualIds?: uuid[];
  assignedTeamIds?: uuid[];
  caseFileNumber?: string;
  caseFileStatus?: CaseFileStatus;
  eventId?: uuid;
  householdId?: uuid;
  isDuplicate?: boolean;
  labels?: ICaseFileLabel[];
  tags?: IListOption[];
  triage?: CaseFileTriage;
  privacyDateTimeConsent: Date | string;

  validate(): Array<string> | boolean;
}

export interface ICaseFileMetadata extends IEntity {
  caseFileStatusName?: IMultilingual;
  event?: IIdMultilingualName;
  primaryBeneficiaryFirstName: string;
  primaryBeneficiaryLastName: string;
  lastActionDate?: Date | string;
  triageName?: IMultilingual;
  tags: IIdMultilingualName[];
}

export type ICaseFileCombined = IEntityCombined<ICaseFileEntity, ICaseFileMetadata>
