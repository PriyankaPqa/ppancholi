import { ECanadaProvinces, IMultilingual, IListOption } from '@libs/core-lib/types';
import { IShelterLocationData } from '../household-create';

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
  responseLevel: EResponseLevel;
  eventType: IListOption;
  dateReported: string;
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
  country?: string;
  streetAddress?: string;
  unitSuite?: string;
  province?: ECanadaProvinces;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface IEventGenericLocation {
  id?: uuid;
  name: IMultilingual;
  status: EEventLocationStatus;
  address: IEventGenericLocationAddress;
}

/**
 * Interface that maps to the response structure from the API
 */
export interface IEventData {
  id: uuid;
  name: IMultilingual;
  responseDetails: IResponseDetails;
  registrationLink: IMultilingual;
  tenantId: uuid;
  registrationLocations: Array<IEventGenericLocation>;
  shelterLocations: IShelterLocationData[];
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
  shelterLocations: IShelterLocationData[];
  registrationLocations: IEventGenericLocation[];
  selfRegistrationEnabled: boolean;
  schedule: IEventSchedule;
}
