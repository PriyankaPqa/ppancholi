import { IMultilingual, IListOption, IIdMultilingualName } from '@libs/shared-lib/types';
import { IEntity, IEntityCombined } from '../base';

/**
 * Enums
 */

export enum CaseFileStatus {
  Inactive = 1,
  Open = 2,
  Closed = 3,
  Archived = 4,
}

// 2674 remove triage options 4-5 for now
export enum CaseFileTriage {
  None = 0,
  Tier1 = 1,
  Tier2 = 2,
  Tier3 = 3,
  // Tier4 = 4,
  // Tier5 = 5,
}

export enum IdentityAuthenticationStatus {
  NotVerified = 0,
  Passed = 1,
  Failed = 2,
}

export enum IdentityAuthenticationMethod {
  NotApplicable = 0,
  Exceptional = 1,
  InPerson = 2,
  System = 3,
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
  IdentityAuthenticationUpdatedStatus = 12,
  ImpactStatusValidationUpdated = 13,
  ReferralAdded = 14,
  ReferralUpdated = 15,
  DocumentDeactivated = 16,
  DocumentUpdated = 17,
  DocumentAdded = 18,
  CaseNoteAdded = 19,
  CaseNoteUpdated = 20,
  Registration = 21,
  PaymentSubmitted = 22,
  HouseholdEdited = 23,
  HouseholdSplit = 24,
  HouseholdMovedMembersOut = 25,
  HouseholdMovedMembersIn = 26,
  HouseholdCreatedAfterSplit = 27,
  PaymentCompleted = 28,
  IdentityAuthenticationUpdatedId = 29,
  AssessmentCompleted = 30,
  FinancialAssistancePayment = 31,
  CaseFileLabelsUpdated = 32,
  PaymentCorrected = 33,
  AssessmentAdded = 34,
  HouseholdStatusChanged = 35,
  ManageDuplicates = 36,
  TempAddressUpdated = 37,
  ImpactedIndividualReceivingAssistance = 38,
  ImpactedIndividualNoLongerReceivingAssistance = 39,
  HouseholdPotentialDuplicateUpdated = 40,
}

export enum HouseholdCaseFileActivityType {
  ContactInformationEdited = 1,
  IdentitySetEdited = 2,
  MemberAdded = 3,
  MemberRemoved = 4,
  HomeAddressEdited = 5,
  TempAddressEdited = 6,
  PrimaryAssigned = 7,
}

export enum RegistrationType {
  Crc = 1,
  Public = 2,
}

export enum ImpactValidationMethod {
  NotApplicable = 0,
  Manual = 1,
  Exception = 2,
  Batch = 3,
}

export enum ValidationOfImpactStatus {
  Undetermined = 0,
  Impacted = 1,
  NotImpacted = 2,
}

/**
 * Interfaces
 */

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

export interface IIdentityAuthentication {
  status: IdentityAuthenticationStatus;
  method: IdentityAuthenticationMethod;
  identificationIds: IListOption[];
  exceptionalAuthenticationTypeId?: IListOption;
}

export interface IImpactStatusValidation {
  method: ImpactValidationMethod;
  status: ValidationOfImpactStatus;
}

export interface IAssignedTeamMembers {
  teamId: uuid;
  teamMembersIds: uuid[];
}
export interface IImpactedIndividual {
  personId: uuid;
  receivingAssistance: boolean;
}

export interface ICaseFileEntity extends IEntity {
  assignedTeamMembers?: IAssignedTeamMembers[],
  assignedTeamIds?: uuid[];
  caseFileNumber?: string;
  caseFileStatus?: CaseFileStatus;
  eventId?: uuid;
  householdId?: uuid;
  impactStatusValidation?: IImpactStatusValidation;
  isDuplicate?: boolean;
  labels?: ICaseFileLabel[];
  tags?: IListOption[];
  triage?: CaseFileTriage;
  privacyDateTimeConsent?: Date | string;
  identityAuthentication?: IIdentityAuthentication;
  impactedIndividuals?: IImpactedIndividual[];

  readonly?: boolean;

  validate(): Array<string> | boolean;
}

export interface ICaseFileMetadata extends IEntity {
  caseFileStatusName?: IMultilingual;
  event?: IIdMultilingualName;
  lastActionDate?: Date | string;
  triageName?: IMultilingual;
  tags: IIdMultilingualName[];
  primaryBeneficiary: {
    id: uuid;
    identitySet: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
    },
    contactInformation: {
      email: string;
    },
  },
  household: {
    address: {
      address: {
        streetAddress: string;
        city: string;
        postalCode: string;
        provinceCode: IMultilingual;
        unitSuite: string;
        longitude: string;
        latitude: string;
        country: string;
      }
    },
  },
  identityAuthenticationStatusName: IMultilingual,
  impactStatusValidationName: IMultilingual,
  appliedProgramIds: uuid[]
  assessments?: { assessmentResponseId: uuid, assessmentFormId: uuid }[],
  hasPotentialDuplicates?: boolean,
}

export type ICaseFileCombined = IEntityCombined<ICaseFileEntity, ICaseFileMetadata>;

export interface ICaseFileCount {
  inactiveCount: number;
  openCount: number;
  closedCount: number;
  archivedCount: number;
}

export interface ICaseFileDetailedCount {
  inactiveCount: number;
  closedCount: number;
  openCount: {
    assigned: number,
    unAssigned: number,
    duplicate: number,
  };
  caseFileTriageCounts: {
    tier1: number,
    tier2: number,
    tier3: number,
    tier4: number,
    tier5: number,
    tierNone: number,
  },
}

export type IdParams = uuid;
