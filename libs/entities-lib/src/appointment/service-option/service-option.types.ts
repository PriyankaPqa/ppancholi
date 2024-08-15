import type { Duration } from 'date-fns';
import { IListOption, IMultilingual } from '@libs/shared-lib/src/types';
import { IEntity } from '../../base';

export interface IAppointmentModality {
  name: IMultilingual;
  isOnline: boolean;
}

export interface IServiceOption extends IEntity {
  name: IMultilingual;
  duration: Duration;
  appointmentModalities: IListOption[];
}
