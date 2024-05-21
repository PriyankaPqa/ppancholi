import { AppointmentProgram } from './appointment-program';
import { mockAppointmentProgram } from './appointment-program.mock';

const mockData = mockAppointmentProgram();

  describe('>>> AppointmentProgram', () => {
    describe('>> constructor', () => {
      describe('instantiate when data is passed', () => {
        it('should instantiate info', () => {
          const item = new AppointmentProgram(mockData);

          expect(item.eventId).toEqual(mockData.eventId);
          expect(item.name).toEqual(mockData.name);
          expect(item.timeZone).toEqual(mockData.timeZone);
          expect(item.bookingHours).toEqual(mockData.bookingHours);
        });

        it('should instantiate on empty', () => {
          const item = new AppointmentProgram();

          expect(item.eventId).toEqual(null);
          expect(item.name).toEqual(null);
          expect(item.timeZone).toEqual(null);
          expect(item.bookingHours).toEqual([]);
        });
      });
    });
});
