// import _cloneDeep from 'lodash/cloneDeep';
import { IMultilingual } from '@libs/shared-lib/types';

import { BaseEntity } from '../../base';
import { IAppointmentEntity } from './appointment.types';

export class AppointmentEntity extends BaseEntity {
  name: IMultilingual;

constructor(data?: IAppointmentEntity) {
  if (data) {
    super(data);
  }
}
}
