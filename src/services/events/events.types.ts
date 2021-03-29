import {
  IEvent, IEventCallCentre, IEventData, IEventSearchData, IOtherProvince, IRegion, IUpdateCallCentrePayload,
} from '@/entities/event';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface IEventsService {
  createEvent(payload: IEvent): Promise<IEventData>;

  updateEvent(payload: IEvent): Promise<IEventData>;

  toggleSelfRegistration(id: uuid, selfRegistrationEnabled: boolean): Promise<IEventData>;

  getOtherProvinces(): Promise<IAzureSearchResult<IOtherProvince>>;

  getRegions(): Promise<IAzureSearchResult<IRegion>>;

  searchEvents(params: IAzureSearchParams): Promise<IAzureSearchResult<IEventSearchData>>;

  addCallCentre(eventId:uuid, payload: IEventCallCentre): Promise<IEventData>;

  editCallCentre(eventId:uuid, payload: IUpdateCallCentrePayload): Promise<IEventData>;
}

export interface IEventsServiceMock {
  createEvent: jest.Mock<IEventData>;

  updateEvent: jest.Mock<IEventData>;

  toggleSelfRegistration: jest.Mock<IEventData>;

  getOtherProvinces: jest.Mock <IAzureSearchResult<IOtherProvince>>;

  getRegions: jest.Mock <IAzureSearchResult<IRegion>>;

  searchEvents: jest.Mock <IAzureSearchResult<IEventSearchData>>;

  addCallCentre: jest.Mock <IEventData>;

  editCallCentre: jest.Mock <IEventData>;
}
