import {
  IEvent,
  IEventCallCentre,
  IEventData,
  IEventGenericLocation,
  IEventSearchData,
  IOtherProvince,
  IRegion,
  IUpdateCallCentrePayload,
  IUpdateRegistrationLocationPayload,
} from '@/entities/event';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface IEventsService {
  createEvent(payload: IEvent): Promise<IEventData>;

  updateEvent(payload: IEvent): Promise<IEventData>;

  toggleSelfRegistration(id: uuid, selfRegistrationEnabled: boolean): Promise<IEventData>;

  getOtherProvinces(): Promise<IAzureSearchResult<IOtherProvince>>;

  getRegions(): Promise<IAzureSearchResult<IRegion>>;

  searchEvents(params: IAzureSearchParams): Promise<IAzureSearchResult<IEventSearchData>>;

  addCallCentre(eventId: uuid, payload: IEventCallCentre): Promise<IEventData>;

  editCallCentre(eventId: uuid, payload: IUpdateCallCentrePayload): Promise<IEventData>;

  addRegistrationLocation(eventId: uuid, payload: IEventGenericLocation): Promise<IEventData>;

  editRegistrationLocation(eventId: uuid, payload: IUpdateRegistrationLocationPayload): Promise<IEventData>;
}

export interface IEventsServiceMock {
  createEvent: jest.Mock<IEventData>;

  updateEvent: jest.Mock<IEventData>;

  getRegions: jest.Mock<IAzureSearchResult<IRegion>>;

  searchEvents: jest.Mock<IAzureSearchResult<IEventSearchData>>;

  toggleSelfRegistration: jest.Mock<IEventData>;

  getOtherProvinces: jest.Mock <IAzureSearchResult<IOtherProvince>>;

  addCallCentre: jest.Mock<IEventData>;

  editCallCentre: jest.Mock<IEventData>;

  addRegistrationLocation: jest.Mock<IEventData>;

  editRegistrationLocation: jest.Mock<IEventData>;
}
