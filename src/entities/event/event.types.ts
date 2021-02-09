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

/**
 * Interface that maps to the response structure from the API
 */
export interface IEventData {
  id: uuid;
  assistanceNumber: string;
  name: IMultilingual;
  description: IMultilingual;
  registrationLink: IMultilingual;
}

/**
 * Interface used for the Event entity class
 */
export interface IEvent extends IEventData {}
