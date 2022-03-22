import {
  EEventStatus,
  IEventAgreement,
  IEventCallCentre,
  IEventEntity,
  IEventGenericLocation,
  IEventLocation,
  IEventMainInfo,
} from '@/entities/event';
import { IDomainBaseService, IDomainBaseServiceMock } from '@/services/base';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface IEventsService extends IDomainBaseService<IEventEntity, uuid>{
  createEvent(payload: IEventEntity): Promise<IEventEntity>;

  updateEvent(payload: IEventEntity): Promise<IEventEntity>;

  toggleSelfRegistration(id: uuid, selfRegistrationEnabled: boolean): Promise<IEventEntity>;

  getOtherProvinces(): Promise<IEventLocation[]>;

  getRegions(): Promise<IEventLocation[]>;

  setEventStatus(id: uuid, status: EEventStatus, hasBeenOpen?: boolean, reason?: string): Promise<IEventEntity>;

  addCallCentre(eventId: uuid, payload: IEventCallCentre): Promise<IEventEntity>;

  editCallCentre(eventId:uuid, payload: IEventCallCentre): Promise<IEventEntity>;

  addAgreement(eventId:uuid, payload: IEventAgreement): Promise<IEventEntity>;

  editAgreement(eventId:uuid, payload: IEventAgreement): Promise<IEventEntity>;

  removeAgreement(eventId:uuid, agreementId: uuid): Promise<IEventEntity>;

  addRegistrationLocation(eventId: uuid, payload: IEventGenericLocation): Promise<IEventEntity>;

  editRegistrationLocation(eventId:uuid, payload: IEventGenericLocation): Promise<IEventEntity>;

  addShelterLocation(eventId: uuid, payload: IEventGenericLocation): Promise<IEventEntity>;

  editShelterLocation(eventId:uuid, payload: IEventGenericLocation): Promise<IEventEntity>;

  searchMyEvents(params: IAzureSearchParams): Promise<IAzureSearchResult<IEventMainInfo>>;
}

export interface IEventsServiceMock extends IDomainBaseServiceMock<IEventEntity> {
  createEvent: jest.Mock<IEventEntity>;
  updateEvent: jest.Mock<IEventEntity>;
  toggleSelfRegistration: jest.Mock<IEventEntity>;
  getOtherProvinces: jest.Mock<IEventLocation[]>;
  getRegions: jest.Mock<IEventLocation[]>;
  setEventStatus: jest.Mock<IEventEntity>;
  addCallCentre: jest.Mock<IEventEntity>;
  editCallCentre: jest.Mock<IEventEntity>;
  addAgreement: jest.Mock<IEventEntity>;
  editAgreement: jest.Mock<IEventEntity>;
  removeAgreement: jest.Mock<IEventEntity>;
  addRegistrationLocation: jest.Mock<IEventEntity>;
  editRegistrationLocation: jest.Mock<IEventEntity>;
  addShelterLocation: jest.Mock<IEventEntity>;
  editShelterLocation: jest.Mock<IEventEntity>;
  searchMyEvents: jest.Mock<IAzureSearchResult<IEventMainInfo>>;
}
