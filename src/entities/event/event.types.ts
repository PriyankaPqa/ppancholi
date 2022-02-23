import {
  ECanadaProvinces, IAddress, IListOption, IMultilingual,
} from '@/types';

import { IEntity, IEntityCombined } from '@/entities/base/base.types';

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
  closeDate: Date | string;
  timestamp: Date | string;
  updateReason: string;
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
  id?: uuid;
  name: IMultilingual;
  details: IMultilingual;
  startDate: Date | string;
  endDate: Date | string;
  status: EEventCallCentreStatus;
}

export interface IEventGenericLocation {
  id?: uuid;
  name: IMultilingual;
  status: EEventLocationStatus;
  address: IAddress;
}

export interface IEventAgreement {
  id?: uuid;
  name: IMultilingual;
  details: IMultilingual;
  startDate: Date | string;
  endDate: Date | string;
  agreementType: IListOption;
}

export interface IEventAgreementInfos extends IEventAgreement {
  agreementTypeName: IMultilingual;
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
  scheduleHistory: IEventSchedule[];
  responseDetails: IEventResponseDetails;
  relatedEventIds?: Array<uuid>;
  agreements: Array<IEventAgreement>;
  callCentres:Array<IEventCallCentre>;
  registrationLocations: Array<IEventGenericLocation>;
  shelterLocations: Array<IEventGenericLocation>;
  selfRegistrationEnabled: boolean;
}

export interface IEventMainInfo {
  entity: {
    id: uuid;
    name: IMultilingual;
    responseDetails: IEventResponseDetails;
    registrationLink: IMultilingual;
    tenantId: uuid;
    registrationLocations: Array<IEventGenericLocation>;
    shelterLocations: Array<IEventGenericLocation>;
    selfRegistrationEnabled: boolean;
    schedule: IEventSchedule;
  }
}

/**
 * Interface that maps to the response structure from the search API
 */
export interface IEventSearchData {
  '@searchScore': number;
  agreements: Array<IEventAgreementInfos>;
  callCentres: Array<IEventCallCentre>;
  registrationLocations: Array<IEventGenericLocation>;
  shelterLocations: Array<IEventGenericLocation>;
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
  scheduleHistory: IEventSchedule[];
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
export interface IEventEntity extends IEntity {
   name?: IMultilingual;
   description?: IMultilingual;
   number?: number;
   selfRegistrationEnabled?: boolean;
   registrationLink?: IMultilingual;
   location?: IEventLocation;
   schedule?: IEventSchedule;
   responseDetails?: IEventResponseDetails;
   registrationLocations?: Array<IEventGenericLocation>;
   callCentres?: Array<IEventCallCentre>;
   scheduleHistory?: IEventSchedule[];
   shelterLocations?: Array<IEventGenericLocation>;
   eventStatus?: number;
   relatedEventIds?: Array<string>;
   agreements?: Array<IEventAgreement>;

   validate(): Array<string> | boolean;
   fillEmptyMultilingualAttributes(): void;
}

export interface IEventMetadata extends IEntity {
  eventTypeId?: uuid;
  agreements?: Array<IEventAgreementInfos>;
  eventTypeName?: IMultilingual;
  scheduleEventStatusName?: IMultilingual;
  relatedEventsInfos?: Array<IRelatedEventsInfos>;
  provinceName?: IMultilingual;
  teamMemberIds?: Array<string>;
  responseLevelName?: IMultilingual;
}

export type IEventCombined = IEntityCombined<IEventEntity, IEventMetadata>
