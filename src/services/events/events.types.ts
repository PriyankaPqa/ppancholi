import { IEventTypeData } from '@/entities/eventType';
import { IEvent, IEventData } from '@/entities/event';

export interface IEventsService {
  createEvent(payload: IEvent): Promise<IEventData>;

  getEvents(): Promise<IEventData[]>;

  getEventTypes(): Promise<Array<IEventTypeData>>;
}

export interface IEventsServiceMock {
  createEvent: jest.Mock <IEventData>;

  getEvents: jest.Mock <IEventData[]>;

  getEventTypes: jest.Mock <IEventTypeData[]>;
}
