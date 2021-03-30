import { ECanadaProvinces, IMultilingual } from '@/types';

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

/**
 * Interface that maps to the response structure from the API
 */
export interface IEventData {
  id: uuid;
  name: IMultilingual;
  responseDetails: IResponseDetails;
  registrationLink: IMultilingual;
  tenantId: uuid;
}

/**
 * Interface used for the Event entity class
 */
export interface IEvent extends IEventData {}
