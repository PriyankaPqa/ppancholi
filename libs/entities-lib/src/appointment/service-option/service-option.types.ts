import { IListOption } from '@libs/shared-lib/src/types';
import { IEntity } from '../../base';

export interface IServiceOption extends IEntity {
  type: IListOption;
  appointmentModalities: IListOption[];
}
