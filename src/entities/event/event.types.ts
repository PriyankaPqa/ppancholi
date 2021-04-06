import {
  ECanadaProvinces, IAddress, IListOption, IMultilingual,
} from '@/types';

/**
 * Enums
 */
export enum EEventStatus {
  OnHold = 1,
  Open = 2,
  Closed = 3,
  Archived = 4
}

export enum EResponseLevel {
  Level01 = 1,
  Level02 = 2,
  Level03 = 3,
  Level04 = 4,
  Level05 = 5,
}

export enum EEventCallCentreStatus {
  Active = 1,
  Inactive,
}

export enum EEventLocationStatus {
  Active = 1,
  Inactive,
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
  reOpenReason: string;
  hasBeenOpen: boolean;
  closeDate: Date | string;
  closeReason: string;
}

export interface IEventResponseDetails {
  responseLevel: EResponseLevel;
  eventType: IListOption;
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

export interface IEventCallCentre {
  name: IMultilingual;
  details: IMultilingual;
  startDate: Date | string;
  endDate: Date | string;
  status: EEventCallCentreStatus;
}

export interface IEventGenericLocation {
  name: IMultilingual;
  status: EEventLocationStatus;
  address: IAddress;
}

export interface IUpdateCallCentrePayload {
  updatedCallCentre: IEventCallCentre,
  originalCallCentre: IEventCallCentre,
}

export interface IEventAgreement {
  name: IMultilingual;
  details: IMultilingual;
  startDate: Date | string;
  endDate: Date | string;
  agreementType: IListOption;
}

export interface IEventAgreementInfos {
  name: IMultilingual;
  details: IMultilingual;
  startDate: Date | string;
  endDate: Date | string;
  agreementType: IListOption;
  agreementTypeName: IMultilingual;
}

export interface IUpdateAgreementPayload {
  updatedAgreement: IEventAgreementInfos,
  originalAgreement: IEventAgreementInfos,
}

export interface IUpdateRegistrationLocationPayload {
  updatedRegistrationLocation: IEventGenericLocation,
  originalRegistrationLocation: IEventGenericLocation,
}

export interface IRelatedEventsInfos {
  id: uuid;
  eventName: IMultilingual;
}

/**
 * Interface that maps to the response structure from the entity API
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
  relatedEventIds?: Array<uuid>;
  agreements: Array<IEventAgreement>;
  callCentres:Array<IEventCallCentre>;
  registrationLocations: Array<IEventGenericLocation>;
  selfRegistrationEnabled: boolean;
}

/**
 * Interface that maps to the response structure from the search API
 */
export interface IEventSearchData {
  '@searchScore': number;
  agreements: Array<IEventAgreementInfos>;
  callCentres: Array<IEventCallCentre>;
  registrationLocations: Array<IEventGenericLocation>;
  createdDate: Date | string;
  eventDescription: IMultilingual;
  eventId: uuid;
  eventName: IMultilingual;
  eventStatus: number;
  eventTypeId: uuid;
  eventTypeName: IMultilingual;
  location: IEventLocation;
  number: number;
  provinceName: IMultilingual;
  relatedEventsInfos: Array<IRelatedEventsInfos>;
  registrationLink: IMultilingual;
  responseDetails: IEventResponseDetails;
  responseLevelName: IMultilingual;
  selfRegistrationEnabled: boolean;
  schedule: IEventSchedule;
  scheduleEventStatusName: IMultilingual;
  tenantId: uuid;
}

/**
 * Create event payload interface
 */
export interface ICreateEventRequest {
  assistanceNumber: string;
  dateReported: Date | string;
  description: IMultilingual;
  name: IMultilingual;
  eventType: IListOption;
  province: ECanadaProvinces;
  provinceOther: IMultilingual;
  region: IMultilingual;
  relatedEventIds: Array<uuid>;
  responseLevel: EResponseLevel;
  scheduledCloseDate: Date | string;
  scheduledOpenDate: Date | string;
  status: EEventStatus;
}

export interface IEditEventRequest extends ICreateEventRequest {
  reOpenReason: string;
  selfRegistrationEnabled: boolean;
}

/**
 * Interface used for the Event entity class
 */
export interface IEvent {
  agreements: Array<IEventAgreementInfos>;
  callCentres: Array<IEventCallCentre>;
  registrationLocations: Array<IEventGenericLocation>;
  created: Date | string;
  description: IMultilingual;
  eventTypeId: uuid;
  eventTypeName: IMultilingual;
  id: uuid;
  location: IEventLocation;
  name: IMultilingual;
  number: number;
  provinceName: IMultilingual;
  registrationLink: IMultilingual;
  relatedEventsInfos: Array<IRelatedEventsInfos>;
  responseDetails: IEventResponseDetails;
  responseLevelName: IMultilingual;
  schedule: IEventSchedule;
  scheduleEventStatusName: IMultilingual;
  selfRegistrationEnabled: boolean;
  eventStatus: number;
  tenantId: uuid;
  validate(): Array<string> | boolean;
  fillEmptyMultilingualAttributes(): void;
}
