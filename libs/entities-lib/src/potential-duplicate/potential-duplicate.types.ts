import { IMultilingual, IUserInformation } from '@libs/shared-lib/types';
import { IPhoneNumber } from '../value-objects/contact-information';
import { IAddressData } from '../value-objects/address';
import { IEntity } from '../base';

export interface IHouseholdAddress {
  address?: IAddressData;
  from?: string;
  to?: string;
  observation?: string;
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

export interface IHouseholdDuplicateStatusHistory {
  userInformation: IUserInformation;
  dateOfAction: string | Date;
  duplicateStatus: DuplicateStatus;
  rationale: string;
}

export interface IDuplicateCaseFileData {
  caseFileId: uuid;
  caseFileNumber: string;
  eventId: uuid;
  eventName: IMultilingual;
}

export interface IDuplicateHousehold {
  householdId: uuid;
  registrationNumber: string;
  caseFiles: IDuplicateCaseFileData[];
  primaryBeneficiaryFullName: string;
  homeAddress?: IHouseholdAddress;
  homePhoneNumber?: IPhoneNumber;
  mobilePhoneNumber?: IPhoneNumber;
  alternatePhoneNumber?: IPhoneNumber;
}

export interface IPotentialDuplicateExtended extends IPotentialDuplicateEntity {
  duplicateHousehold: IDuplicateHousehold
}

export interface IPotentialDuplicateEntity extends IEntity {
  householdIds: uuid[];
  duplicateReasons: DuplicateReason[];
  duplicateStatus: DuplicateStatus;
  duplicateStatusHistory: IHouseholdDuplicateStatusHistory[];
  memberFirstName?: string;
  memberLastName?: string;
}

export type IdParams = uuid;
