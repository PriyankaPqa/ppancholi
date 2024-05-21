import type { Duration } from 'date-fns';
import { IMultilingual } from '@libs/shared-lib/src/types';
import { IEntity } from '../../base';

export interface IAppointmentModality {
  appointmentModalityId: uuid;
  name: IMultilingual;
  isOnline: boolean;
}

export interface IServiceOption extends IEntity {
  name: IMultilingual;
  appointmentProgramId: uuid;
  duration: Duration;
  emailConfirmationSubject: IMultilingual;
  emailConfirmationContent: IMultilingual;
  appointmentModalities: IAppointmentModality[];
}
