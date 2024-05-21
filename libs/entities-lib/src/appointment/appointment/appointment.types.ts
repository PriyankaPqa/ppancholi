import { IUserInformation } from '@libs/shared-lib/src/types';
import { IEntity, IEntityCombined } from '../../base';

/**
 * Enums
 */
export enum AppointmentStatus {
  Upcoming = 1,
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
  staffMemberId: uuid;
  appointmentStatus: AppointmentStatus;
  notes: string;
  // Account used to create emails in MSGraph
  masterAccountEmail: string;
  sendConfirmationEmail: boolean;
  appointmentHistory: IAppointmentStatusHistory[];
}

export type IAppointmentCombined = IEntityCombined<IAppointment, IEntity>;
