import { IListOption, IUserInformation } from '@libs/shared-lib/types';
import { IEntity } from '../../base';

/**
 * Enums
 */
export enum AppointmentStatus {
  Scheduled = 1,
  Cancelled = 2,
  Rescheduled = 3,
}

/**
 * Value objects
 */

export interface IAppointmentStatusHistory {
  userInformation: IUserInformation;
  dateOfChange: Date | string;
  appointmentStatus: AppointmentStatus;
  rationale: string,
}

/**
 * Interface used for the Appointment entity class
 */
export interface IAppointment extends IEntity {
  caseFileId: uuid;
  appointmentProgramId: uuid;
  serviceOptionId: uuid;
  appointmentModalityId: uuid;
  onlineMeetingUrl: string;
  startDate: Date | string;
  endDate: Date | string;
  // The id specific for a single event (I called like this in MS booking)
  iCalUID: string
  // The id for a group of recurring appointments
  seriesMasterId: string;
  attendeeId: uuid;
  attendeeEmail: string;
  userAccountId: uuid;
  appointmentStatus: AppointmentStatus;
  notes: string;
  preferredLanguage: IListOption;
  sendConfirmationEmail: boolean;
  rescheduled: boolean;
  appointmentHistory: IAppointmentStatusHistory[];
}
