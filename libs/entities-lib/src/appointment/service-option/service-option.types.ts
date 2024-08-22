import { IListOption } from '@libs/shared-lib/types';
import { IEntity } from '../../base';

export interface IServiceOption extends IEntity {
  type: IListOption;
  appointmentModalities: IListOption[];
}
