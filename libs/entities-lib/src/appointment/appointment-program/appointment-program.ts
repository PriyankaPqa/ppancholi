import _cloneDeep from 'lodash/cloneDeep';
import { IMultilingual } from '@libs/shared-lib/types';
import utils from '../../utils';
import { BaseEntity } from '../../base';
import { AppointmentProgramStatus, IAppointmentProgram, IDaySchedule } from './appointment-program.types';
import { IServiceOption } from '../service-option/service-option.types';

export class AppointmentProgram extends BaseEntity {
  eventId: uuid;

  name: IMultilingual;

  timeZone: string;

  businessHours: IDaySchedule[];

  serviceOptions: IServiceOption[];

  appointmentProgramStatus: AppointmentProgramStatus;

  constructor(data?: IAppointmentProgram) {
    if (data) {
      super(data);
      this.eventId = data?.eventId;
      this.name = data?.name;
      this.timeZone = data?.timeZone;
      this.businessHours = data?.businessHours ? _cloneDeep(data.businessHours) : [];
      this.serviceOptions = data?.serviceOptions ? _cloneDeep(data.serviceOptions) : [];
      this.appointmentProgramStatus = data?.appointmentProgramStatus;
    } else {
      super();
      this.eventId = null;
      this.name = utils.initMultilingualAttributes();
      this.timeZone = null;
      this.businessHours = [];
      this.serviceOptions = [];
      this.appointmentProgramStatus = AppointmentProgramStatus.Active;
    }
  }
}
