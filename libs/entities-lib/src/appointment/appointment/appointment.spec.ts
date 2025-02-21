import { Appointment } from './appointment';
import { mockAppointment } from './appointment.mock';
import { AppointmentStatus } from './appointment.types';

const mockData = mockAppointment();

  describe('>>> Appointment', () => {
    describe('>> constructor', () => {
      describe('instantiate when data is passed', () => {
        it('should instantiate info', () => {
          const item = new Appointment(mockData);

          expect(item.caseFileId).toEqual(mockData.caseFileId);
          expect(item.appointmentProgramId).toEqual(mockData.appointmentProgramId);
          expect(item.serviceOptionId).toEqual(mockData.serviceOptionId);
          expect(item.appointmentModalityId).toEqual(mockData.appointmentModalityId);
          expect(item.onlineMeetingUrl).toEqual(mockData.onlineMeetingUrl);
          expect(item.startDate).toEqual(mockData.startDate);
          expect(item.endDate).toEqual(mockData.endDate);
          expect(item.iCalUID).toEqual(mockData.iCalUID);
          expect(item.seriesMasterId).toEqual(mockData.seriesMasterId);
          expect(item.attendeeId).toEqual(mockData.attendeeId);
          expect(item.attendeeEmail).toEqual(mockData.attendeeEmail);
          expect(item.userAccountId).toEqual(mockData.userAccountId);
          expect(item.appointmentStatus).toEqual(mockData.appointmentStatus);
          expect(item.notes).toEqual(mockData.notes);
          expect(item.preferredLanguage).toEqual(mockData.preferredLanguage);
          expect(item.sendConfirmationEmail).toEqual(mockData.sendConfirmationEmail);
          expect(item.rescheduled).toEqual(mockData.rescheduled);
          expect(item.appointmentHistory).toEqual(mockData.appointmentHistory);
        });
        it('should instantiate on empty', () => {
          const item = new Appointment();
          expect(item.caseFileId).toEqual(null);
          expect(item.appointmentProgramId).toEqual(null);
          expect(item.serviceOptionId).toEqual(null);
          expect(item.appointmentModalityId).toEqual(null);
          expect(item.onlineMeetingUrl).toEqual(null);
          expect(item.startDate).toEqual(null);
          expect(item.endDate).toEqual(null);
          expect(item.iCalUID).toEqual(null);
          expect(item.seriesMasterId).toEqual(null);
          expect(item.attendeeId).toEqual(null);
          expect(item.attendeeEmail).toEqual(null);
          expect(item.userAccountId).toEqual(null);
          expect(item.appointmentStatus).toEqual(AppointmentStatus.Scheduled);
          expect(item.notes).toEqual(null);
          expect(item.preferredLanguage).toEqual(null);
          expect(item.sendConfirmationEmail).toEqual(null);
          expect(item.rescheduled).toEqual(false);
          expect(item.appointmentHistory).toEqual([]);
        });
      });
    });
});
