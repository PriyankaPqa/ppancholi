import { IMultilingual } from '@/types';

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

export interface ICaseFileBeneficiary {
  id: uuid;
  firstName: string;
  lastName: string;
}

export interface ICaseFileEvent {
  id: uuid;
  name: IMultilingual;
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
  duplicate: boolean;
  eventId: uuid;
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
  duplicate: boolean;
  event: ICaseFileEvent;
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
  triage: ETriageLevel;
  triageName: IMultilingual;
  tenantId: uuid;
  validate(): Array<string> | boolean;
}
