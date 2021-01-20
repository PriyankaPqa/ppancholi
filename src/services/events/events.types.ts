import { IRestResponse } from '@/types';
import { IEventTypeData } from '@/entities/eventType';
import { IEvent, IEventData } from '@/entities/event';

export interface IEventsService {
  createEvent(payload: IEvent): Promise<IRestResponse<IEventData>>;

  getEvents(): Promise<IRestResponse<IEventData[]>>;

  getEventTypes(): Promise<IRestResponse<IEventTypeData[]>>;
}

export interface IEventsServiceMock {
  createEvent: jest.Mock <IEventData>;

  getEvents: jest.Mock <IEventData[]>;

  getEventTypes: jest.Mock <IEventTypeData[]>;
}
