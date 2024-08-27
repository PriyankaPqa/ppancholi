import { Status } from '@libs/shared-lib/types';
import { mockUserInformation } from '../../user-account';
import { mockBaseData } from '../../base';
import { mockServiceOption } from '../service-option/service-option.mock';
import { DayOfWeek, IAppointmentProgram, IDaySchedule } from './appointment-program.types';

export const mockBookingHour = (force?: Partial<IDaySchedule>): IDaySchedule => ({
  day: DayOfWeek.Monday,
  timeSlots: [{ start: '09:00:00', end: '12:00:00' }, { start: '13:00:00', end: '17:00:00' }],
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
  timeZone: 'Eastern Standard Time',
  businessHours: mockBusinessHours(),
  serviceOptions: [mockServiceOption()],
  appointmentProgramStatus: Status.Active,
  appointmentProgramStatusHistory: { userInformation: mockUserInformation(), rationale: 'rationale', dateOfAction: '2021-01-01' },
  emailConfirmationSubject: { translation: { en: 'mock-emailConfirmationSubject-en', fr: 'mock-emailConfirmationSubject-fr' } },
  emailConfirmationMessage: { translation: { en: 'mock-emailConfirmationMessage-en', fr: 'mock-emailConfirmationMessage-fr' } },
  ...force,
});
