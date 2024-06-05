import _cloneDeep from 'lodash/cloneDeep';
import { IMultilingual } from '@libs/shared-lib/types';

import { BaseEntity } from '../../base';
import { IAppointmentProgram, IDaySchedule } from './appointment-program.types';

export class AppointmentProgram extends BaseEntity {
  eventId: uuid;

  name: IMultilingual;

  timeZone: string;

  bookingHours: IDaySchedule[];

constructor(data?: IAppointmentProgram) {
  if (data) {
    super(data);
    this.eventId = data?.eventId;
    this.name = data?.name;
    this.timeZone = data?.timeZone;
    this.bookingHours = data?.bookingHours ? _cloneDeep(data.bookingHours) : [];
  } else {
    super();
    this.eventId = null;
    this.name = null;
    this.timeZone = null;
    this.bookingHours = [];
  }
}
}
