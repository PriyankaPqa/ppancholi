import { IAddressData } from '../value-objects/address';
import { ECurrentAddressTypes } from '../value-objects/current-address';
import { IEntity } from '../base';

export enum RoomType {
  TwoBeds = 1,
  OneBedOneSofaBed = 2,
  TwoBedsOneSofaBed = 3,
}

export enum RoomOption {
  PetFriendly = 1,
  BabyBed = 2,
  LowestFloor = 3,
  AccessibilityRoom = 4,
  Elevator = 5,
}

export enum BookingRequestState {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
}

export interface IBookingRequest extends IEntity {
  householdId: string;
  caseFileId: string;
  addressType: ECurrentAddressTypes;
  crcProvided: boolean;
  address: IAddressData;
  checkIn: string;
  checkOut: string;
  shelterLocationId?: uuid;
  numberOfAdults: number;
  numberOfChildren: number;
  numberOfRooms: number;
  roomTypes: RoomType[];
  roomOptions: RoomOption[];
  notes: string;
  state: BookingRequestState;
  rejectionRationale?: string;
  actionedBy?: string;
  actionedOn?: string;
}

export type IdParams = { id: uuid, caseFileId: uuid };
