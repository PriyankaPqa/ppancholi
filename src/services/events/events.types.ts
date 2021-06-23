import {
  IEvent,
  IEventCallCentre,
  IEventData,
  IEventGenericLocation,
  IEventSearchData,
  IOtherProvince,
  IRegion,
  EEventStatus,
  IEventAgreementInfos,
} from '@/entities/event';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface IEventsService {
  createEvent(payload: IEvent): Promise<IEventData>;

  updateEvent(payload: IEvent): Promise<IEventData>;

  toggleSelfRegistration(id: uuid, selfRegistrationEnabled: boolean): Promise<IEventData>;

  getOtherProvinces(): Promise<IAzureSearchResult<IOtherProvince>>;

  getRegions(): Promise<IAzureSearchResult<IRegion>>;

  searchEvents(params: IAzureSearchParams): Promise<IAzureSearchResult<IEventSearchData>>;

  searchMyEvents(params: IAzureSearchParams): Promise<IAzureSearchResult<IEventSearchData>>;

  setEventStatus(id: uuid, status: EEventStatus, hasBeenOpen?: boolean, reason?: string): Promise<IEventData>;

  addCallCentre(eventId: uuid, payload: IEventCallCentre): Promise<IEventData>;

  editCallCentre(eventId:uuid, payload: IEventCallCentre): Promise<IEventData>;

  addAgreement(eventId:uuid, payload: IEventAgreementInfos): Promise<IEventData>;

  editAgreement(eventId:uuid, payload: IEventAgreementInfos): Promise<IEventData>;

  removeAgreement(eventId:uuid, agreementId: uuid): Promise<IEventData>;

  addRegistrationLocation(eventId: uuid, payload: IEventGenericLocation): Promise<IEventData>;

  editRegistrationLocation(eventId:uuid, payload: IEventGenericLocation): Promise<IEventData>;

  addShelterLocation(eventId: uuid, payload: IEventGenericLocation): Promise<IEventData>;

  editShelterLocation(eventId:uuid, payload: IEventGenericLocation): Promise<IEventData>;
}

export interface IEventsServiceMock {
  createEvent: jest.Mock<IEventData>;

  updateEvent: jest.Mock<IEventData>;

  getRegions: jest.Mock<IAzureSearchResult<IRegion>>;

  searchEvents: jest.Mock<IAzureSearchResult<IEventSearchData>>;

  searchMyEvents: jest.Mock<IAzureSearchResult<IEventSearchData>>;

  toggleSelfRegistration: jest.Mock<IEventData>;

  getOtherProvinces: jest.Mock<IAzureSearchResult<IOtherProvince>>;

  setEventStatus: jest.Mock<IEventData>;

  addCallCentre: jest.Mock<IEventData>;

  editCallCentre: jest.Mock<IEventData>;

  addAgreement: jest.Mock <IEventData>;

  editAgreement: jest.Mock <IEventData>;

  removeAgreement: jest.Mock <IEventData>;

  addRegistrationLocation: jest.Mock<IEventData>;

  editRegistrationLocation: jest.Mock<IEventData>;

  addShelterLocation: jest.Mock<IEventData>;

  editShelterLocation: jest.Mock<IEventData>;
}
