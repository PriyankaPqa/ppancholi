import { Address } from '../value-objects/address';
import { ECurrentAddressTypes, ICurrentAddressCreateRequest } from '../value-objects/current-address';
import { IEntity } from '../base';

export enum MembershipStatus {
  Active = 1,
  Removed = 2,
}

export interface ReceivingAssistanceDetail extends IEntity {
  detailDate: string | Date;
  receivingAssistance: boolean;
  rationale: string;
}

export interface TemporaryAddress extends IEntity {
  addressType: ECurrentAddressTypes;
  placeName: string;
  placeNumber: string;
  address: Address;
  from: string | Date;
  to: string | Date;
  shelterLocationId: uuid;
  checkIn: string | Date;
  checkOut: string | Date;
  crcProvided: boolean;
  takeover?: boolean;
  relatedBookingRequest?: string;
  relatedPaymentIds: string[];
}

export interface ICaseFileIndividualEntity extends IEntity {
  caseFileId: uuid;
  personId: uuid;
  receivingAssistanceDetails: ReceivingAssistanceDetail[];
  currentAddress: TemporaryAddress;
  temporaryAddressHistory: TemporaryAddress[];
  receivingAssistance: boolean;
  membershipStatus: MembershipStatus;
}

export interface ReceivingAssistanceDetailCreateRequest {
  receivingAssistance: boolean;
  rationale?: string;
}

export interface ICaseFileIndividualCreateRequest {
  caseFileId?: uuid;
  personId: uuid;
  receivingAssistanceDetails: ReceivingAssistanceDetailCreateRequest[];
  temporaryAddressHistory: ICurrentAddressCreateRequest[];
  membershipStatus: MembershipStatus;
}

export type IdParams = { id: uuid, caseFileId: uuid };
