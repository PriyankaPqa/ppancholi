import { IMultilingualEnum, IMultilingualWithId, IListOption, IIdMultilingualName,
    IdentityAuthenticationStatus, IdentityAuthenticationMethod, Tier2State,
    Status,
} from '@libs/shared-lib/types';
import { IEventSummary } from '../event';
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

export { IdentityAuthenticationMethod, IdentityAuthenticationStatus };

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
  TaskManagementTaskCreated = 41,
  TaskManagementTaskCompleted = 42,
  RecoveryPlanUpdate = 43,
  CommunicationSent = 44,
  PaymentMoved = 45,
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
  triggeredByMassAction?: boolean;
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
  recoveryPlan: IRecoveryPlan;

  readonly?: boolean;

  validate(): Array<string> | boolean;
}

export interface ICaseFileSummary {
  id: uuid,
  eventId?: uuid;
  householdId?: uuid;
  caseFileNumber?: string;
  caseFileStatus?: CaseFileStatus;
  triage?: CaseFileTriage;
  impactStatusValidation?: IImpactStatusValidation;
  identityAuthentication?: IIdentityAuthentication;
  tags?: IListOption[];
  assignedTeamMembers?: IAssignedTeamMembers[],
  assignedTeamIds?: uuid[];
  impactedIndividuals?: IImpactedIndividual[];
  hasAccess: boolean;
}

export interface ICaseFileMetadata extends IEntity {
  caseFileStatusName?: IMultilingualEnum;
  event?: IMultilingualWithId;
  lastActionDate?: Date | string;
  triageName?: IMultilingualEnum;
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
    id: uuid;
    streetAddress: string;
    city: string;
    postalCode: string;
    provinceCode: IMultilingualEnum;
    unitSuite: string;
    longitude: string;
    latitude: string;
    country: string;
  },
  identityAuthenticationStatusName: IMultilingualEnum,
  impactStatusValidationName: IMultilingualEnum,
  hasPotentialDuplicates?: boolean,
  appliedProgramIds: uuid[]
  assessments?: { assessmentResponseId: uuid, assessmentFormId: uuid }[],
}

export type ICaseFileCombined = IEntityCombined<ICaseFileEntity, ICaseFileMetadata>;

export interface ICaseFileCount {
  inactiveCount: number;
  openCount: number;
  closedCount: number;
  archivedCount: number;
}

export interface CaseFileSearchOptimized {
  id: uuid;
  created: string | Date;
  status: Status;
  householdId: string;
  eventId: string;
  caseFileNumber: string;
  hasPotentialDuplicates: boolean;
  eventNameEn: string;
  eventNameFr: string;
  primaryBeneficiaryFirstName: string;
  primaryBeneficiaryLastName: string;
  lastActionDate: string | Date;
}

export interface SearchOptimizedResults {
  odataCount?: number;
  value: {
    searchItem: CaseFileSearchOptimized;
    entity?: ICaseFileEntity;
    metadata?: ICaseFileMetadata;
  }[]
}

export interface ICaseFileDetailedCount {
  inactiveCount: number;
  closedCount: number;
  openCount: {
    assigned: number,
    unAssigned: number,
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

export interface ITier2Request {
  id: uuid,
  identityVerificationTier1transactionId: string,
  mainDocumentTypeId: number,
  subDocumentTypeId: number,
  locale: string,
}

export interface ITier2Response {
  identityAuthenticationStatus: IdentityAuthenticationStatus,
  processCompleted: boolean,
  transactionUniqueId: uuid,
  identityVerificationInfoSubmissionUrl: string,
  tier2State: Tier2State;
}

export interface ITier2Details {
  caseFileId: uuid;
  event: IEventSummary;
  canCompleteTier2: boolean;
  tier2response: ITier2Response;
  registrationNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
}

export interface IRecoveryPlan {
  hasRecoveryPlan: boolean;
  crcProvided: boolean;
  startDate: string | Date;
}

export type IdParams = uuid;
