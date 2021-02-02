import { IEventTypeData } from '@/entities/eventType';
import {
  IEvent, IEventData, IOtherProvince, IRegion,
} from '@/entities/event';
import { ISearchData } from '@/types';

export interface IEventsService {
  createEvent(payload: IEvent): Promise<IEventData>;

  getEvents(): Promise<IEventData[]>;

  getEventTypes(): Promise<Array<IEventTypeData>>;

  getOtherProvinces(): Promise<IOtherProvince[]>;

  getRegions(): Promise<IRegion[]>;

  searchEvents(params: ISearchData): Promise<IEventData[]>;
}

export interface IEventsServiceMock {
  createEvent: jest.Mock <IEventData>;

  getEvents: jest.Mock <IEventData[]>;

  getEventTypes: jest.Mock <IEventTypeData[]>;

  getOtherProvinces: jest.Mock <IOtherProvince[]>;

  getRegions: jest.Mock <IRegion[]>;

  searchEvents: jest.Mock <IEventData[]>;
}
