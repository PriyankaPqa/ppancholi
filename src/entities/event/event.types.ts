import { ECanadaProvinces, IMultilingual } from '../../types';
import { IShelterLocation } from '../beneficiary';

/**
 * Enums
 */
export enum EEventStatus {
  OnHold = 1,
  Open,
  Closed,
  Archived,
}

export enum EResponseLevel {
  Level1 = 1,
  Level2,
  Level3,
  Level4,
  Level5,
}

/**
 * Value objects
 */
export interface IRegion {
  province: ECanadaProvinces;
  name: IMultilingual;
}

export interface IOtherProvince {
  name: IMultilingual;
}

export interface IResponseDetails {
  assistanceNumber: string;
}

export interface IEventSchedule {
  status: EEventStatus;
}

export enum EEventLocationStatus {
  Active = 1,
  Inactive,
}

export interface IEventGenericLocationAddress {
  country: string;
  streetAddress: string;
  unitSuite?: string;
  province: ECanadaProvinces;
  city: string;
  postalCode: string;
  latitude?: string;
  longitude?: string;
}

export interface IEventGenericLocation {
  name: IMultilingual;
  status: EEventLocationStatus;
  address: IEventGenericLocationAddress;
}

/**
 * Interface that maps to the response structure from the API
 */
export interface IEventData {
  eventId: uuid;
  eventName: IMultilingual;
  responseDetails: IResponseDetails;
  registrationLink: IMultilingual;
  tenantId: uuid;
  registrationLocations: Array<IEventGenericLocation>;
  shelterLocations: IShelterLocation[];
  selfRegistrationEnabled: boolean;
  schedule: IEventSchedule;
}

/**
 * Interface used for the Event entity class
 */
export interface IEvent {
  id: uuid;
  name: IMultilingual;
  responseDetails: IResponseDetails;
  registrationLink: IMultilingual;
  tenantId: uuid;
  shelterLocations: IShelterLocation[];
  registrationLocations: IEventGenericLocation[];
  selfRegistrationEnabled: boolean;
  schedule: IEventSchedule;
}
