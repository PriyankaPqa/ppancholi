import { IMultilingual, IUserInformation } from '@libs/shared-lib/src/types';
import { IEntity, IEntityCombined } from '../base';
import { IPhoneNumber } from '../value-objects/contact-information';
import { IAddressData } from '../value-objects/address';
import { IAssessmentResponseEntity } from '../assessment-template';
import { ICaseFileEntity } from '../case-file';

export enum HouseholdStatus {
  Open = 0,
  Closed = 1,
  Archived = 2,
}

export enum DuplicateReason {
  FullName = 1,
  HomeAddress = 2,
  HomePhoneNumber = 3,
  MobilePhoneNumber = 4,
  AlternatePhoneNumber = 5,
}

export enum DuplicateStatus {
  Potential = 1,
  Resolved = 2,
}

export interface IHouseholdAddress {
  address?: IAddressData;
  from?: string;
  to?: string;
  observation?: string;
}

export interface IHouseholdDuplicateStatusHistory {
  userInformation: IUserInformation;
  dateOfAction: string | Date;
  duplicateStatus: DuplicateStatus;
  rationale: string;
}

export interface IHouseholdDuplicate extends IEntity {
  householdId: uuid;
  duplicateReasons: DuplicateReason[];
  duplicateStatus: DuplicateStatus;
  duplicateStatusHistory: IHouseholdDuplicateStatusHistory[];
  memberFirstName?: string;
  memberLastName?: string;
}

export interface IDuplicateCaseFileData {
  caseFileId: uuid;
  caseFileNumber: string;
  eventId: uuid;
  eventName: IMultilingual;
}

export interface IDuplicateData {
  potentialDuplicateId: uuid;
  registrationNumber: string;
  caseFiles: IDuplicateCaseFileData[];
  primaryBeneficiaryFullName: string;
  homeAddress?: IHouseholdAddress;
  homePhoneNumber?: IPhoneNumber;
  mobilePhoneNumber?: IPhoneNumber;
  alternatePhoneNumber?: IPhoneNumber;
}

export interface IHouseholdDuplicateFullData extends IHouseholdDuplicate, IDuplicateData {
}

export interface IHouseholdEntity extends IEntity {
  address?: IHouseholdAddress;
  addressHistory?: Array<IHouseholdAddress>;
  members?: Array<string>;
  primaryBeneficiary?: string;
  registrationNumber?: string;
  householdStatus: HouseholdStatus;
  potentialDuplicates?: IHouseholdDuplicate[];
}

export interface IHouseholdMemberMetadata {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  homePhoneNumber: IPhoneNumber;
  mobilePhoneNumber: IPhoneNumber;
  alternatePhoneNumber: IPhoneNumber;
}

export interface IHouseholdCaseFile {
  eventId: uuid;
  caseFileId: uuid;
  caseFileNumber: string;
  caseFileStatus: number;
  registeredDate: string | Date;
}

export interface IHouseholdMetadata extends IEntity {
  memberMetadata: Array<IHouseholdMemberMetadata>;
}

export type IHouseholdCombined = IEntityCombined<IHouseholdEntity, IHouseholdMetadata>;

export interface IOustandingPaymentResponse {
  hasOutstandingPayments: boolean;
}

export interface IDetailedRegistrationResponse {
  assessmentResponses: IAssessmentResponseEntity[];
  caseFile: ICaseFileEntity;
  household: IHouseholdEntity;
}

export type IdParams = uuid;
