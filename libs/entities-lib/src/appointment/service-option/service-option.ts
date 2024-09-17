import _cloneDeep from 'lodash/cloneDeep';
import { IListOption, Status } from '@libs/shared-lib/types';

import { BaseEntity } from '../../base';
import { IServiceOption } from './service-option.types';

export class ServiceOption extends BaseEntity {
  serviceOptionType: IListOption;

  duration: Duration;

  appointmentModalities: IListOption[];

  serviceOptionStatus: Status;

  constructor(data?: IServiceOption) {
    if (data) {
      super(data);
      this.serviceOptionType = data.serviceOptionType;
      this.appointmentModalities = data.appointmentModalities ? _cloneDeep(data.appointmentModalities) : [];
      this.serviceOptionStatus = data.serviceOptionStatus;
    } else {
      super();
      this.serviceOptionType = { optionItemId: null, specifiedOther: null };
      this.appointmentModalities = [];
      this.serviceOptionStatus = Status.Active;
    }
  }
}
