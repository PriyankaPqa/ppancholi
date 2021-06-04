import { IMultilingual, IListOption, IIdMultilingualName } from '@/types';
import { IOptionItem } from '../optionItem';

/**
 * Enums
 */

export enum ECaseFileStatus {
  Inactive = 1,
  Open = 2,
  Closed = 3,
  Archived = 4,
}

export enum ECaseFileTriage {
  None = 0,
  Tier1 = 1,
  Tier2 = 2,
  Tier3 = 3,
  Tier4 = 4,
  Tier5 = 5,
}

export enum ECaseFileActivityType {
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
  UnassignedFromCaseFile = 11
}

/**
 * Interfaces
 */

export interface ICaseFileHouseholdPhoneNumber {
  number: string;
  extension: string;
}

export interface ICaseFileHouseholdMemberContactInfo {
  email: string;
  mobilePhoneNumber: ICaseFileHouseholdPhoneNumber;
  homePhoneNumber: ICaseFileHouseholdPhoneNumber;
  alternatePhoneNumber: ICaseFileHouseholdPhoneNumber;
}

export interface ICaseFileHouseholdAddress {
  country: string;
  streetAddress: string;
  unitSuite: string;
  provinceCode: IMultilingual;
  city: string;
  postalCode: string;
}

export interface ICaseFileHouseholdAddressData {
  address?: ICaseFileHouseholdAddress;
  from?: string;
  to?: string;
}

export interface ICaseFileHouseholdMemberIdentitySet {
  firstName: string;
  middleName: string;
  lastName: string;
  preferredName: string;
  dateOfBirth: string;
}

export interface ICaseFileHouseholdMember {
  id: uuid;
  identitySet: ICaseFileHouseholdMemberIdentitySet;
  contactInformation: ICaseFileHouseholdMemberContactInfo;
}

export interface ICaseFileHousehold {
  id: uuid;
  address: ICaseFileHouseholdAddressData;
  addressHistory: ICaseFileHouseholdAddressData[];
  houseHoldMemberCount: number;
  members: uuid[];
  primaryBeneficiary: ICaseFileHouseholdMember;
  registrationNumber: string;
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
  activityType: ECaseFileActivityType;
  details: Record<string, unknown>;
}

/**
 * Interface of the case file entity (returned when a case file is updated)
 */

export interface ICaseFileData {
  id: uuid;
  assignedIndividualIds: uuid[];
  assignedTeamIds: uuid[];
  caseFileNumber: string;
  caseFileStatus: ECaseFileStatus;
  created: Date | string;
  isDuplicate: boolean;
  eventId: uuid;
  householdId: uuid;
  labels: ICaseFileLabel[];
  tags: IListOption[];
  triage: ECaseFileTriage;
  eTag: string;
  tenantId: uuid;
  timestamp: Date | string;
}

/**
 * Interface of the case file projection data
 */
export interface ICaseFileSearchData {
  caseFileId: uuid;
  assignedIndividualIds: uuid[];
  assignedTeamIds: uuid[];
  caseFileCreatedDate: Date | string;
  caseFileNumber: string;
  caseFileStatus: ECaseFileStatus;
  caseFileStatusName: IMultilingual;
  event: IIdMultilingualName;
  household: ICaseFileHousehold;
  lastActionDate: Date | string;
  isDuplicate: boolean;
  labels: ICaseFileLabel[];
  tags: IIdMultilingualName[];
  timestamp: Date | string;
  triage: ECaseFileTriage;
  triageName: IMultilingual;
  tenantId: uuid;
}

export interface ICaseFile {
  id: uuid;
  assignedIndividualIds: uuid[];
  assignedTeamIds: uuid[];
  caseFileNumber: string;
  caseFileStatus: ECaseFileStatus;
  caseFileStatusName: IMultilingual;
  created: Date | string;
  event: IIdMultilingualName;
  household: ICaseFileHousehold;
  lastActionDate: Date | string;
  isDuplicate: boolean;
  labels: ICaseFileLabel[];
  tags: IIdMultilingualName[];
  timestamp: Date | string;
  triage: ECaseFileTriage;
  triageName: IMultilingual;
  tenantId: uuid;

  validate(): Array<string> | boolean;
}

export interface ICaseNote {
  subject: string;
  category: IOptionItem;
  description: string;
}
