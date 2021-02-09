import { ECanadaProvinces, IMultilingual } from '@/types';

/**
 * Enums
 */
export enum EEventStatus {
  OnHold = 1,
  Open,
  Closed,
  Archived
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
export interface IEventLocation {
  province: ECanadaProvinces;
  provinceOther: IMultilingual;
  region: IMultilingual;
}

export interface IEventSchedule {
  status: EEventStatus;
  scheduledOpenDate: Date | string;
  scheduledCloseDate: Date | string;
  openDate: Date | string;
  closeDate: Date | string;
  closeReason: string;
}

export interface IEventResponseDetails {
  responseLevel: EResponseLevel;
  eventType: uuid;
  dateReported: Date | string;
  assistanceNumber: string;
}

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
  created: Date | string;
  timestamp: Date | string;
  eTag: string;
  number: number;
  name: IMultilingual;
  description: IMultilingual;
  registrationLink: IMultilingual;
  location: IEventLocation;
  schedule: IEventSchedule;
  responseDetails: IEventResponseDetails;
  relatedEvents?: Array<uuid>;
}

/**
 * Create event payload interface
 */
export interface ICreateEventRequest {
  assistanceNumber: string;
  dateReported: Date | string;
  description: IMultilingual;
  name: IMultilingual;
  province: ECanadaProvinces;
  provinceOther: IMultilingual;
  region: IMultilingual;
  relatedEvents: Array<uuid>;
  responseLevel: EResponseLevel;
  scheduledCloseDate: Date | string;
  scheduledOpenDate: Date | string;
  status: EEventStatus;
}

/**
 * Interface used for the Event entity class
 */
export interface IEvent extends IEventData {
  validate(): Array<string> | boolean;
  fillEmptyMultilingualAttributes(): void;
}
