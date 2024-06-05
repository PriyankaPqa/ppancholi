import { Address } from '../value-objects/address';
import { ECurrentAddressTypes } from '../value-objects/current-address';
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
}

export interface ICaseFileIndividualEntity extends IEntity {
  caseFileId: uuid;
  personId: uuid;
  receivingAssistanceDetails: ReceivingAssistanceDetail[];
  currentAddress: TemporaryAddress;
  temporaryAddressHistory: TemporaryAddress[];
  receivingAssistance: boolean;
}

export type IdParams = { id: uuid, caseFileId: uuid };
