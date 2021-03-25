import { IEvent, IOtherProvince, IRegion } from '@/entities/event';
import { IOptionItem } from '@/entities/optionItem';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface IStorage {
  getters: {
    eventTypes(): Array<IOptionItem>;
    events(): Array<IEvent>;
    openEvents(): Array<IEvent>;
    eventById(id:uuid): IEvent;
  }

  actions: {
    fetchEvent(id: uuid): Promise<IEvent>;
    fetchEventTypes(): Promise<IOptionItem[]>;
    fetchEvents(): Promise<IEvent[]>;
    fetchOtherProvinces(): Promise<IAzureSearchResult<IOtherProvince>>
    fetchRegions(): Promise<IAzureSearchResult<IRegion>>;
    searchEvents(params: IAzureSearchParams): Promise<IAzureSearchResult<IEvent>>;
    createEvent(payload: IEvent): Promise<IEvent>;
    updateEvent(payload: IEvent): Promise<IEvent>;
  }
}

export interface IStorageMock {
  getters: {
    eventTypes: jest.Mock<void>;
    events: jest.Mock<void>;
    openEvents: jest.Mock<void>;
    eventById: jest.Mock<void>;
  }

  actions: {
    fetchEventTypes: jest.Mock<void>;
    fetchEvent: jest.Mock<void>;
    fetchEvents: jest.Mock<void>;
    fetchOtherProvinces: jest.Mock<void>;
    fetchRegions: jest.Mock<void>;
    createEvent: jest.Mock<void>;
    updateEvent: jest.Mock<void>;
  }
}
