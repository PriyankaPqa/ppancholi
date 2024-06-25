import { IMemberEntity } from '../household-create';
import { IEntity } from '../base';
import { IAddressData } from '../value-objects/address';
import { IAssessmentResponseEntity } from '../assessment-template';
import { ICaseFileEntity } from '../case-file';

export enum HouseholdStatus {
  Open = 0,
  Closed = 1,
  Archived = 2,
}

export interface IHouseholdAddress {
  address?: IAddressData;
  from?: string;
  to?: string;
  observation?: string;
}

export interface IHouseholdEntity extends IEntity {
  address?: IHouseholdAddress;
  addressHistory?: Array<IHouseholdAddress>;
  members?: Array<string>;
  membersHistory?: Array<{ memberId: uuid, from: string | Date, to?: string | Date }>;
  primaryBeneficiary?: string;
  primaryBeneficiariesHistory?: Array<{ memberId: uuid, from: string | Date, to?: string | Date }>;
  registrationNumber?: string;
  householdStatus: HouseholdStatus;
}

export interface IHouseholdEntityWithMembers extends IHouseholdEntity {
  primaryBeneficiaryMember?: IMemberEntity;
  householdMembers?: { isPrimary: boolean, personId: uuid, person: IMemberEntity }[];
}

export interface IHouseholdCaseFile {
  eventId: uuid;
  caseFileId: uuid;
  caseFileNumber: string;
  caseFileStatus: number;
  registeredDate: string | Date;
}

export interface IOustandingPaymentResponse {
  hasOutstandingPayments: boolean;
}

export interface IDetailedRegistrationResponse {
  assessmentResponses: IAssessmentResponseEntity[];
  caseFile: ICaseFileEntity;
  household: IHouseholdEntity;
  mustDoTier2authentication: boolean;
  tier1transactionId: string;
}

export type IdParams = uuid;
