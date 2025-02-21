import {
  ECanadaProvinces, IListOption, IMultilingual,
} from '@libs/shared-lib/types';

import { IEntity } from '../base';
import { IAddress, IAddressData } from '../value-objects/address';

/**
 * Enums
 */
export enum EEventStatus {
  OnHold = 1,
  Open = 2,
  Closed = 3,
  Archived = 4,
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
  address: IAddress | IAddressData
}

export interface IEventAgreement {
  id?: uuid;
  name: IMultilingual;
  details: IMultilingual;
  startDate: Date | string;
  endDate: Date | string;
  agreementType: IListOption;
}

export interface IConsentStatement {
  id?: uuid;
  name: IMultilingual;
  statement: IMultilingual;
}

export interface IEventAgreementInfos extends IEventAgreement {
  agreementTypeName: IMultilingual;
}

export interface IRegistrationAssessment extends IEntity {
  assessmentId: string;
  sectionTitle: IMultilingual;
  details: IMultilingual;
}

/**
 * Interface that maps to the response structure from the API
 */
export interface IEventSummary {
  id: uuid;
  name: IMultilingual;
  responseDetails: IEventResponseDetails;
  registrationLink: IMultilingual;
  tenantId: uuid;
  registrationLocations: Array<IEventGenericLocation>;
  shelterLocations: IEventGenericLocation[];
  selfRegistrationEnabled: boolean;
  assessmentsForL0usersEnabled: boolean;
  schedule: { status: EEventStatus; openDate?: Date | string; },
  registrationAssessments: IRegistrationAssessment[];
  consentStatementId?: uuid;
}

/**
 * Interface that maps to the response structure from the entity API
 */
export interface IEventData {
  id: uuid;
  created: Date | string;
  timestamp: Date | string;
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
  consentStatementId?: uuid;
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
  consentStatementId?: uuid;
  authenticationTier1disabled?: boolean;
  authenticationTier2disabled?: boolean;
}

export interface IEditEventRequest extends ICreateEventRequest {
  reOpenReason: string;
  selfRegistrationEnabled: boolean;
  assessmentsForL0usersEnabled: boolean;
  registrationsForL0usersEnabled: boolean;
  appointmentBookingForL0usersEnabled: boolean;
}

export interface IEventExceptionalAuthenticationType { exceptionalAuthenticationTypeId: uuid, maxNumberOfUsages?: number }

/**
 * Interface used for the Event entity class
 */
export interface IEventEntity extends IEntity, IEventSummary {
   name: IMultilingual;
   description: IMultilingual;
   number: number;
   selfRegistrationEnabled: boolean;
   registrationLink: IMultilingual;
   location: IEventLocation;
   schedule: IEventSchedule;
   responseDetails: IEventResponseDetails;
   registrationAssessments: Array<IRegistrationAssessment>;
   registrationLocations: Array<IEventGenericLocation>;
   callCentres: Array<IEventCallCentre>;
   scheduleHistory: IEventSchedule[];
   shelterLocations: Array<IEventGenericLocation>;
   eventStatus: number;
   relatedEventIds: Array<string>;
   agreements: Array<IEventAgreement>;
   assessmentsForL0usersEnabled: boolean;
   registrationsForL0usersEnabled: boolean;
   appointmentBookingForL0usersEnabled: boolean;
   consentStatementId: uuid;
   authenticationTier1disabled: boolean;
   authenticationTier2disabled: boolean;
   exceptionalAuthenticationTypes: Array<IEventExceptionalAuthenticationType>;

   validate(): Array<string> | boolean;
   fillEmptyMultilingualAttributes(): void;
}

export type IdParams = uuid;
