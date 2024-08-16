import _cloneDeep from 'lodash/cloneDeep';
import { IListOption } from '@libs/shared-lib/types';

import { BaseEntity } from '../../base';
import { IServiceOption } from './service-option.types';

export class ServiceOption extends BaseEntity {
  type: IListOption;

  duration: Duration;

  appointmentModalities: IListOption[];

  constructor(data?: IServiceOption) {
    if (data) {
      super(data);
      this.type = data?.type;
      this.appointmentModalities = data?.appointmentModalities ? _cloneDeep(data.appointmentModalities) : [];
    } else {
      super();
      this.type = { optionItemId: null, specifiedOther: null };
      this.appointmentModalities = [];
    }
  }
}
