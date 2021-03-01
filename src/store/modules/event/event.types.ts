import { IOptionItemData } from '@/entities/optionItem';
import { IEventData } from '@/entities/event';

export type IState = {
  eventTypes: IOptionItemData[];
  events: IEventData[];
  eventTypesFetched: boolean;
  eventsFetched: boolean;
};
