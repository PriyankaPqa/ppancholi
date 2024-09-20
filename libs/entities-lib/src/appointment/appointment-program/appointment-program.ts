import _cloneDeep from 'lodash/cloneDeep';
import { IMultilingual, Status } from '@libs/shared-lib/types';
import utils from '../../utils';
import { BaseEntity } from '../../base';
import { IAppointmentProgram, IAppointmentProgramStatusHistory, IDaySchedule } from './appointment-program.types';
import { IServiceOption } from '../service-option/service-option.types';

export class AppointmentProgram extends BaseEntity {
  eventId: uuid;

  name: IMultilingual;

  timeZone: string;

  businessHours: IDaySchedule[];

  serviceOptions: IServiceOption[];

  appointmentProgramStatus: Status;

  emailConfirmationSubject: IMultilingual;

  emailConfirmationMessage: IMultilingual;

  appointmentProgramStatusHistory: IAppointmentProgramStatusHistory;

  constructor(data?: IAppointmentProgram) {
    if (data) {
      super(data);
      this.eventId = data.eventId;
      this.name = data.name;
      this.timeZone = data.timeZone;
      this.businessHours = data.businessHours ? _cloneDeep(data.businessHours) : [];
      this.serviceOptions = data.serviceOptions ? _cloneDeep(data.serviceOptions) : [];
      this.appointmentProgramStatus = data.appointmentProgramStatus;
      this.emailConfirmationSubject = data.emailConfirmationSubject;
      this.emailConfirmationMessage = data.emailConfirmationMessage;
      this.appointmentProgramStatusHistory = _cloneDeep(data.appointmentProgramStatusHistory);
    } else {
      super();
      this.eventId = null;
      this.name = utils.initMultilingualAttributes();
      this.timeZone = null;
      this.businessHours = [];
      this.serviceOptions = [];
      this.appointmentProgramStatus = Status.Active;
      this.emailConfirmationMessage = utils.initMultilingualAttributes();
      this.emailConfirmationSubject = utils.initMultilingualAttributes();
      this.appointmentProgramStatusHistory = null;
    }
  }

  public fillEmptyMultilingualAttributes() {
    this.name = utils.getFilledMultilingualField(this.name);
    this.emailConfirmationMessage = utils.getFilledMultilingualField(this.emailConfirmationMessage);
    this.emailConfirmationSubject = utils.getFilledMultilingualField(this.emailConfirmationSubject);
  }
}
