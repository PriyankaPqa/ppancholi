import {
  IEvent, IEventData, IOtherProvince, IRegion,
} from '@/entities/event';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface IEventsService {
  createEvent(payload: IEvent): Promise<IEventData>;

  getEvents(): Promise<IEventData[]>;

  getOtherProvinces(): Promise<IOtherProvince[]>;

  getRegions(): Promise<IRegion[]>;

  searchEvents(params: IAzureSearchParams): Promise<IAzureSearchResult<IEventData>>;
}

export interface IEventsServiceMock {
  createEvent: jest.Mock <IEventData>;

  getEvents: jest.Mock <IEventData[]>;

  getOtherProvinces: jest.Mock <IOtherProvince[]>;

  getRegions: jest.Mock <IRegion[]>;

  searchEvents: jest.Mock <IAzureSearchResult<IEventData>>;
}
