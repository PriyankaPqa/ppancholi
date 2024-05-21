import { mockBaseData } from '../../base';
import { IAppointmentModality, IServiceOption } from './service-option.types';

export const mockAppointmentModality = (force?: Partial<IAppointmentModality>): IAppointmentModality => ({
  appointmentModalityId: 'mock-appointmentModalityId',
  name: { translation: { en: 'mock-appointmentModality-name-en', fr: 'mock-appointmentModality-name-fr' } },
  isOnline: true,
    ...force,
  });

export const mockServiceOption = (force? : Partial<IServiceOption>): IServiceOption => ({
  ...mockBaseData(),
  name: { translation: { en: 'service-option-name-en', fr: 'service-option-name-fr' } },
  appointmentProgramId: 'mock-appointmentProgramId',
  duration: { minutes: 30 },
  emailConfirmationSubject: { translation: { en: 'mock-emailConfirmationSubject-en', fr: 'mock-emailConfirmationSubject-fr' } },
  emailConfirmationContent: { translation: { en: 'mock-emailConfirmationContent-en', fr: 'mock-emailConfirmationContent-fr' } },
  appointmentModalities: [mockAppointmentModality()],
  ...force,
});
