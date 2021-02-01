import { IEventTypeData } from '@/entities/eventType';
import { IEventData } from '@/entities/event';

export type IState = {
  eventTypes: IEventTypeData[];
  events: IEventData[];
  eventTypesFetched: boolean;
  eventsFetched: boolean;
};
