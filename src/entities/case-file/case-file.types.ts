import { IMultilingual, IListOption } from '@/types';

/**
 * Enums
 */

export enum ECaseFileStatus {
  Inactive = 1,
  Open = 2,
  Closed = 3,
  Archived = 4,
}

export enum ETriageLevel {
  None = 0,
  Tier1 = 1,
  Tier2 = 2,
  Tier3 = 3,
  Tier4 = 4,
  Tier5 = 5,
}

/**
 * Interfaces
 */

export interface ICaseFileBeneficiaryPhoneNumber {
  number: string;
  extension: string;
}

export interface ICaseFileBeneficiaryContactInfo {
  email: string;
  mobilePhoneNumber: ICaseFileBeneficiaryPhoneNumber;
  homePhoneNumber: ICaseFileBeneficiaryPhoneNumber;
  alternatePhoneNumber: ICaseFileBeneficiaryPhoneNumber;
}

export interface ICaseFileBeneficiaryAddress{
  country: string;
  streetAddress: string;
  unitSuite: string;
  provinceCode: IMultilingual;
  city: string;
  postalCode: string;
}

export interface ICaseFileBeneficiary {
  id: uuid;
  firstName: string;
  lastName: string;
  contactInformation: ICaseFileBeneficiaryContactInfo;
  homeAddress: ICaseFileBeneficiaryAddress;
  householdMemberCount: number;
}

export interface ICaseFileEvent {
  id: uuid;
  name: IMultilingual;
}

export interface ICaseFileTagInfos {
  id: uuid;
  name: IMultilingual;
}

export interface ICaseFileLabel {
  order: number;
  name: string;
}

/**
 * Interface of the case file entity (returned when a case file is updated)
 */

export interface ICaseFileData {
  id: uuid;
  beneficiaryId: uuid;
  caseFileNumber: string;
  caseFileStatus: ECaseFileStatus;
  created: Date | string;
  isDuplicate: boolean;
  eventId: uuid;
  tags: IListOption[];
  labels: ICaseFileLabel[];
  triage: ETriageLevel;
  eTag: string;
  tenantId: uuid;
  timestamp: Date | string;
}

/**
 * Interface of the case file projection data
 */
export interface ICaseFileSearchData {
  caseFileId: uuid;
  beneficiary: ICaseFileBeneficiary;
  caseFileCreatedDate: Date | string;
  caseFileNumber: string;
  caseFileStatus: ECaseFileStatus;
  caseFileStatusName: IMultilingual;
  isDuplicate: boolean;
  event: ICaseFileEvent;
  tags: ICaseFileTagInfos[];
  labels: ICaseFileLabel[];
  triage: ETriageLevel;
  triageName: IMultilingual;
  tenantId: uuid;
}

export interface ICaseFile {
  id: uuid;
  beneficiary: ICaseFileBeneficiary;
  caseFileNumber: string;
  caseFileStatus: ECaseFileStatus;
  caseFileStatusName: IMultilingual;
  created: Date | string;
  event: ICaseFileEvent;
  isDuplicate: boolean;
  tags: ICaseFileTagInfos[];
  labels: ICaseFileLabel[];
  triage: ETriageLevel;
  triageName: IMultilingual;
  tenantId: uuid;
  validate(): Array<string> | boolean;
}
