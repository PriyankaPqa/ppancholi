import { mockUserInformation } from '../../user-account';
import { mockBaseData } from '../../base';
import { AppointmentStatus, IAppointment, IAppointmentStatusHistory } from './appointment.types';

  export const mockAppointmentStatusHistory = (force?: Partial<IAppointmentStatusHistory>): IAppointmentStatusHistory => ({
    userInformation: mockUserInformation(),
    dateOfChange: '2024-01-24T16:00:00.000Z',
    appointmentStatus: AppointmentStatus.Scheduled,
    rationale: 'mock-rationale',
    ...force,
  });

export const mockAppointment = (force? : Partial<IAppointment>): IAppointment => ({
  ...mockBaseData(),
  caseFileId: 'mock-caseFileId',
  appointmentProgramId: 'mock-appointmentProgramId',
  onlineMeetingUrl: 'mock-onlineMeetingUrl',
  attendeeId: 'mock-attendeeId',
  attendeeEmail: 'mock-attendeeEmail',
  startDate: '2024-01-29T16:00:00.000Z',
  endDate: '2024-01-29T18:00:00.000Z',
  serviceOptionId: 'mock-serviceOptionId',
  appointmentModalityId: 'mock-appointmentModalityId',
  iCalUID: 'mock-iCalUID',
  seriesMasterId: null,
  userAccountId: 'mock-userAccountId',
  appointmentStatus: AppointmentStatus.Scheduled,
  notes: 'mock-notes',
  masterAccountEmail: 'mock-masterAccountEmail',
  sendConfirmationEmail: null,
  rescheduled: false,
  appointmentHistory: [mockAppointmentStatusHistory()],
  ...force,
});
