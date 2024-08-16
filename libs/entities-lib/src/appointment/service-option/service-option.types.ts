import { IListOption, Status } from '@libs/shared-lib/types';
import { IEntity } from '../../base';

export interface IServiceOption extends IEntity {
  serviceOptionType: IListOption;
  appointmentModalities: IListOption[];
  serviceOptionStatus: Status;
}
