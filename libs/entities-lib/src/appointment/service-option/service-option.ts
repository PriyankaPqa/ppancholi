import _cloneDeep from 'lodash/cloneDeep';
import { IListOption, Status } from '@libs/shared-lib/types';

import { BaseEntity } from '../../base';
import { IServiceOption } from './service-option.types';

export class ServiceOption extends BaseEntity {
  serviceOptionType: IListOption;

  duration: Duration;

  appointmentModalities: IListOption[];

  serviceOptionStatus: Status;

  staffMembers: uuid[];

  constructor(data?: IServiceOption) {
    if (data) {
      super(data);
      this.serviceOptionType = data?.serviceOptionType;
      this.appointmentModalities = data?.appointmentModalities ? _cloneDeep(data.appointmentModalities) : [];
      this.serviceOptionStatus = data?.serviceOptionStatus;
      this.staffMembers = data?.staffMembers;
    } else {
      super();
      this.serviceOptionType = { optionItemId: null, specifiedOther: null };
      this.appointmentModalities = [];
      this.serviceOptionStatus = Status.Active;
      this.staffMembers = [];
    }
  }
}
