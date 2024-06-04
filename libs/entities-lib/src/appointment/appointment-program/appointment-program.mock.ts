import { mockBaseData } from '../../base';
import { DayOfWeek, IAppointmentProgram, IDaySchedule } from './appointment-program.types';

export const mockBookingHour = (force?: Partial<IDaySchedule>): IDaySchedule => ({
  day: DayOfWeek.Monday,
  timeSlots: [{ start: '9:00 AM', end: '12:00 PM' }, { start: '1:00 PM', end: '5:00 PM' }],
  ...force,
});

export const mockBookingHours = (force?: IDaySchedule): IDaySchedule[] => {
  const hours:IDaySchedule[] = [
    mockBookingHour({ day: DayOfWeek.Tuesday }),
    mockBookingHour({ day: DayOfWeek.Wednesday }),
    mockBookingHour({ day: DayOfWeek.Thursday }),
    mockBookingHour({ day: DayOfWeek.Friday }),

  ];
  return force ? [...hours, force] : hours;
};

export const mockAppointmentProgram = (force? : Partial<IAppointmentProgram>): IAppointmentProgram => ({
  ...mockBaseData(),
  eventId: 'mock-eventId',
  name: { translation: { en: 'mock-appointment-program-name-en', fr: 'mock-appointment-program-name-fr' } },
  timeZone: 'America/Toronto',
  bookingHours: mockBookingHours(),
  ...force,
});
