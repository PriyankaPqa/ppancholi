import _cloneDeep from 'lodash/cloneDeep';
import { IMultilingual } from '@libs/shared-lib/types';

import { BaseEntity } from '../../base';
import { IAppointmentProgram, IDaySchedule } from './appointment-program.types';
import { IServiceOption } from '../service-option/service-option.types';

export class AppointmentProgram extends BaseEntity {
  eventId: uuid;

  name: IMultilingual;

  timeZone: string;

  businessHours: IDaySchedule[];

  serviceOptions: IServiceOption[];

constructor(data?: IAppointmentProgram) {
  if (data) {
    super(data);
    this.eventId = data?.eventId;
    this.name = data?.name;
    this.timeZone = data?.timeZone;
    this.businessHours = data?.businessHours ? _cloneDeep(data.businessHours) : [];
    this.serviceOptions = data?.serviceOptions ? _cloneDeep(data.serviceOptions) : [];
  } else {
    super();
    this.eventId = null;
    this.name = null;
    this.timeZone = null;
    this.businessHours = [];
    this.serviceOptions = [];
  }
}
}
