import _cloneDeep from 'lodash/cloneDeep';
import { IListOption, IMultilingual } from '@libs/shared-lib/types';

import { BaseEntity } from '../../base';
import { IServiceOption } from './service-option.types';

export class ServiceOption extends BaseEntity {
  name: IMultilingual;

  duration: Duration;

  appointmentModalities: IListOption[];

  constructor(data?: IServiceOption) {
    if (data) {
      super(data);
      this.name = data?.name;
      this.duration = data?.duration;
      this.appointmentModalities = data?.appointmentModalities ? _cloneDeep(data.appointmentModalities) : [];
    } else {
      super();
      this.name = null;
      this.duration = null;
      this.appointmentModalities = [];
    }
  }
}
