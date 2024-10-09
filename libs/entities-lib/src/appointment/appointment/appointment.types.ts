import { IListOption, IUserInformation } from '@libs/shared-lib/types';
import { IEntity } from '../../base';
import { IStaffMemberAvailabilityRequest } from '../appointment-staff-member/appointment-staff-member.types';

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

export interface IAppointmentRequest extends IAppointment, IStaffMemberAvailabilityRequest {
}

/**
 * Interface used for the Appointment entity class
 */
export interface IAppointment extends IEntity {
  caseFileId: uuid;
  appointmentProgramId: uuid;
  serviceOptionId: uuid;
  appointmentModalityId: uuid;
  startDate: Date | string;
  endDate: Date | string;
  attendeeId: uuid;
  attendeeEmail: string;
  userAccountId: uuid;
  appointmentStatus: AppointmentStatus;
  notes: string;
  preferredLanguage: IListOption;
  // The id for a group of recurring appointments
  seriesMasterId?: string;
  sendConfirmationEmail: boolean;
  // The id specific for a single event (I called like this in MS booking)
  iCalUID?: string
  onlineMeetingUrl?: string;
  appointmentHistory?: IAppointmentStatusHistory[];
}
