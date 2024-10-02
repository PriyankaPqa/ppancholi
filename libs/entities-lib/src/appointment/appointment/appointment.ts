import _cloneDeep from 'lodash/cloneDeep';
import { BaseEntity } from '../../base';
import { AppointmentStatus, IAppointment, IAppointmentStatusHistory } from './appointment.types';

export class Appointment extends BaseEntity {
  caseFileId: uuid;

  appointmentProgramId: uuid;

  serviceOptionId: uuid;

  appointmentModalityId: uuid;

  onlineMeetingUrl: string;

  startDate: Date | string;

  endDate: Date | string;

  // The id specific for a single event (I called like this in MS booking)
  iCalUID: string;

  // The id for a group of recurring appointments
  seriesMasterId: string;

  attendeeId: uuid;

  attendeeEmail: string;

  userAccountId: uuid;

  appointmentStatus: AppointmentStatus;

  notes: string;

  // Account used to create emails in MSGraph
  masterAccountEmail: string;

  sendConfirmationEmail: boolean;

  rescheduled: boolean;

  appointmentHistory: IAppointmentStatusHistory[];

constructor(data?: IAppointment) {
  if (data) {
    super(data);
    this.caseFileId = data.caseFileId;
    this.appointmentProgramId = data.appointmentProgramId;
    this.serviceOptionId = data.serviceOptionId;
    this.appointmentModalityId = data.appointmentModalityId;
    this.onlineMeetingUrl = data.onlineMeetingUrl;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.iCalUID = data.iCalUID;
    this.seriesMasterId = data.seriesMasterId;
    this.attendeeId = data.attendeeId;
    this.attendeeEmail = data.attendeeEmail;
    this.userAccountId = data.userAccountId;
    this.appointmentStatus = data.appointmentStatus;
    this.notes = data.notes;
    this.masterAccountEmail = data.masterAccountEmail;
    this.sendConfirmationEmail = data.sendConfirmationEmail;
    this.rescheduled = data.rescheduled;
    this.appointmentHistory = data.appointmentHistory ? _cloneDeep(data.appointmentHistory) : null;
  } else {
    super();
    this.caseFileId = null;
    this.appointmentProgramId = null;
    this.serviceOptionId = null;
    this.appointmentModalityId = null;
    this.onlineMeetingUrl = null;
    this.startDate = null;
    this.endDate = null;
    this.iCalUID = null;
    this.seriesMasterId = null;
    this.attendeeId = null;
    this.attendeeEmail = null;
    this.userAccountId = null;
    this.appointmentStatus = AppointmentStatus.Scheduled;
    this.notes = null;
    this.masterAccountEmail = null;
    this.sendConfirmationEmail = null;
    this.rescheduled = false;
    this.appointmentHistory = [];
  }
}
}
