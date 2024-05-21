import _cloneDeep from 'lodash/cloneDeep';
import { IMultilingual } from '@libs/shared-lib/types';

import { BaseEntity } from '../../base';
import { IAppointmentModality, IServiceOption } from './service-option.types';

export class ServiceOption extends BaseEntity {
  name: IMultilingual;

  appointmentProgramId: uuid;

  duration: Duration;

  emailConfirmationSubject: IMultilingual;

  emailConfirmationContent: IMultilingual;

  appointmentModalities: IAppointmentModality[];

  constructor(data?: IServiceOption) {
    if (data) {
      super(data);
      this.name = data?.name;
      this.appointmentProgramId = data?.appointmentProgramId;
      this.duration = data?.duration;
      this.emailConfirmationSubject = data?.emailConfirmationSubject;
      this.emailConfirmationContent = data?.emailConfirmationContent;
      this.appointmentModalities = data?.appointmentModalities ? _cloneDeep(data.appointmentModalities) : [];
    } else {
      super();
      this.name = null;
      this.appointmentProgramId = null;
      this.duration = null;
      this.emailConfirmationSubject = null;
      this.emailConfirmationContent = null;
      this.appointmentModalities = [];
    }
  }
}
