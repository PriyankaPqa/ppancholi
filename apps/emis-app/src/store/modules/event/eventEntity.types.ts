import { IEventEntity } from '@libs/entities-lib/event';
import { IOptionItemData } from '@libs/entities-lib/optionItem';
import { IState } from '../base/base.types';

export interface IEventEntityState extends IState<IEventEntity> {
  agreementTypes: IOptionItemData[];
  agreementTypesFetched: boolean;
  eventTypes: IOptionItemData[];
  eventTypesFetched: boolean;
  searchLoading: boolean,
}
