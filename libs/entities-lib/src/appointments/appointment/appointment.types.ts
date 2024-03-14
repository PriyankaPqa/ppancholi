import { IEntity } from '../../base';

/**
 * Enums
 */
export enum EAppointmentStatus {
  OnHold = 1,
  Open = 2,
  Closed = 3,
  Archived = 4,
}

/**
 * Value objects
 */

export interface IDateTimeTimeZone {
  dateTime: string;
  timeZone: string;
}

export interface ICustomer {
  customerId: string;
  customQuestionAnswers?: string[]; // TBD type
  emailAddress: string;
  location?: string, // TBD type
  name: string,
  notes?: string,
  phone?: string,
  timeZone: string
}

/**
 * Interface that maps to the response structure from the entity API
 */
export interface IAppointmentData {

}

/**
 * Interface that maps to the response structure from the search API
 */
export interface IAppointmentSearchData {
  '@searchScore': number;

}

/**
 * Interface used for the Appointment entity class
 */
export interface IAppointmentEntity extends IEntity {
  additionalInformation?: string;
  isLocationOnline: Boolean;
  joinWebUrl?: string;
  optOutOfCustomerEmail?: Boolean;
  postBuffer?: string | Date;
  preBuffer?: string | Date;
  reminders?: string[]; // TBD type
  serviceId: string;
  serviceLocation?: string; // TBD type
  serviceName: string;
  serviceNotes?: string;
  staffMemberIds: string[];
  startDateTime: IDateTimeTimeZone;
  endDateTime: IDateTimeTimeZone;
  outcome: string; // AppointmentOutcome??
  appointmentStatus: number // Scheduled/Cancelled/Rescheduled ??
  caseFileId: uuid;
  actualDuration: number;
  recurringGroupId: uuid; // for recurring appoitments??
  appointmentProgramId: uuid;
}

// export interface IAppointmentMetadata extends IEntity {

// }

// export type IAppointmentCombined = IEntityCombined<IAppointmentEntity, IAppointmentMetadata>;

export type IdParams = uuid;
