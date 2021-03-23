import {
  IEvent, IEventData, IEventSearchData, IOtherProvince, IRegion,
} from '@/entities/event';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface IEventsService {
  createEvent(payload: IEvent): Promise<IEventData>;

  updateEvent(payload: IEvent): Promise<IEventData>;

  getOtherProvinces(): Promise<IAzureSearchResult<IOtherProvince>>;

  getRegions(): Promise<IAzureSearchResult<IRegion>>;

  searchEvents(params: IAzureSearchParams): Promise<IAzureSearchResult<IEventSearchData>>;
}

export interface IEventsServiceMock {
  createEvent: jest.Mock<IEventData>;

  updateEvent: jest.Mock<IEventData>;

  getOtherProvinces: jest.Mock <IAzureSearchResult<IOtherProvince>>;

  getRegions: jest.Mock <IAzureSearchResult<IRegion>>;

  searchEvents: jest.Mock <IAzureSearchResult<IEventSearchData>>;
}
