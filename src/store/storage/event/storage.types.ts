import { IEvent, IOtherProvince, IRegion } from '@/entities/event';
import { IEventType } from '@/entities/eventType';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface IStorage {
  getters: {
    eventTypes(): Array<IEventType>;
    events(): Array<IEvent>;
  }

  actions: {
    fetchEventTypes(): Promise<IEventType[]>;
    fetchEvents(): Promise<IEvent[]>;
    fetchOtherProvinces(): Promise<IAzureSearchResult<IOtherProvince>>
    fetchRegions(): Promise<IAzureSearchResult<IRegion>>;
    searchEvents(params: IAzureSearchParams): Promise<IAzureSearchResult<IEvent>>;
    createEvent(payload: IEvent): Promise<IEvent>;
  }
}

export interface IStorageMock {
  getters: {
    eventTypes: jest.Mock<void>;
    events: jest.Mock<void>;
  }

  actions: {
    fetchEventTypes: jest.Mock<void>;
    fetchEvents: jest.Mock<void>;
    fetchOtherProvinces: jest.Mock<void>;
    fetchRegions: jest.Mock<void>;
    createEvent: jest.Mock<void>;
  }
}
