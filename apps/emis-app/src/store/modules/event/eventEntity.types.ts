import { IEventEntity } from '@/entities/event';
import { IOptionItemData } from '@/entities/optionItem';
import { IState } from '../base/base.types';

export interface IEventEntityState extends IState<IEventEntity> {
  agreementTypes: IOptionItemData[];
  agreementTypesFetched: boolean;
  eventTypes: IOptionItemData[];
  eventTypesFetched: boolean;
  searchLoading: boolean,
}
