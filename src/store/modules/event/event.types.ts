import { IOptionItemData } from '@/entities/optionItem';
import { IEvent } from '@/entities/event';

export type IState = {
  eventTypes: IOptionItemData[];
  events: IEvent[];
  eventTypesFetched: boolean;
  eventsFetched: boolean;
};
