import {
  IEvent, IEventCallCentre, IEventGenericLocation, IOtherProvince, IRegion, IUpdateCallCentrePayload, IUpdateRegistrationLocationPayload,
} from '@/entities/event';
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
    addCallCentre({ eventId, payload }:{eventId: uuid, payload: IEventCallCentre}): Promise<IEvent>;
    editCallCentre({ eventId, payload }:{eventId: uuid, payload: IUpdateCallCentrePayload}): Promise<IEvent>;
    addRegistrationLocation({ eventId, payload }:{eventId: uuid, payload: IEventGenericLocation}): Promise<IEvent>;
    editRegistrationLocation({ eventId, payload }:{eventId: uuid, payload: IUpdateRegistrationLocationPayload}): Promise<IEvent>;
    toggleSelfRegistration(payload: { id: uuid; selfRegistrationEnabled: boolean }): Promise<IEvent>;
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
    addCallCentre: jest.Mock<void>;
    editCallCentre: jest.Mock<void>;
    addRegistrationLocation: jest.Mock<void>;
    editRegistrationLocation: jest.Mock<void>;
    toggleSelfRegistration: jest.Mock<void>;
  }
}
