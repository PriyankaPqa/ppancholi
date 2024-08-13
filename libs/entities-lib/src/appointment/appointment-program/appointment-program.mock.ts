import { mockBaseData } from '../../base';
import { mockServiceOption } from '../service-option/service-option.mock';
import { AppointmentProgramStatus, DayOfWeek, IAppointmentProgram, IDaySchedule } from './appointment-program.types';

export const mockBookingHour = (force?: Partial<IDaySchedule>): IDaySchedule => ({
  day: DayOfWeek.Monday,
  timeSlots: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '17:00' }],
  ...force,
});

export const mockBusinessHours = (force?: IDaySchedule): IDaySchedule[] => {
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
  businessHours: mockBusinessHours(),
  serviceOptions: [mockServiceOption()],
  appointmentProgramStatus: AppointmentProgramStatus.Active,
  emailConfirmationSubject: { translation: { en: 'mock-emailConfirmationSubject-en', fr: 'mock-emailConfirmationSubject-fr' } },
  emailConfirmationMessage: { translation: { en: 'mock-emailConfirmationMessage-en', fr: 'mock-emailConfirmationMessage-fr' } },
  ...force,
});
