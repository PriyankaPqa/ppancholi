import {
  EEventStatus,
  IEventAgreement,
  IEventCallCentre,
  IEventEntity,
  IEventGenericLocation,
  IEventLocation,
  IEventMainInfo,
  IRegistrationAssessment,
} from '@libs/entities-lib/event';
import { IAzureSearchParams, IAzureSearchResult } from '@libs/shared-lib/types';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface IEventsService extends IDomainBaseService<IEventEntity, uuid> {
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

  searchMyEventsById(ids: string[]): Promise<IAzureSearchResult<IEventMainInfo>>;

  searchMyRegistrationEvents(params: IAzureSearchParams): Promise<IAzureSearchResult<IEventMainInfo>>;

  addRegistrationAssessment(eventId: uuid, payload: IRegistrationAssessment): Promise<IEventEntity>;

  editRegistrationAssessment(eventId:uuid, payload: IRegistrationAssessment): Promise<IEventEntity>;

  removeRegistrationAssessment(eventId:uuid, agreementId: uuid): Promise<IEventEntity>;

  toggleAssessmentsForL0Users(id: uuid, assessmentsForL0UsersEnabled: boolean): Promise<IEventEntity>;

  toggleRegistrationForL0Users(id: uuid, registrationsForL0UsersEnabled: boolean): Promise<IEventEntity>;
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
  addRegistrationAssessment: jest.Mock<IEventEntity>;
  editRegistrationAssessment: jest.Mock<IEventEntity>;
  removeRegistrationAssessment: jest.Mock<IEventEntity>;
  addShelterLocation: jest.Mock<IEventEntity>;
  editShelterLocation: jest.Mock<IEventEntity>;
  searchMyEvents: jest.Mock<IAzureSearchResult<IEventMainInfo>>;
  searchMyEventsById: jest.Mock<IAzureSearchResult<IEventMainInfo>>;
  searchMyRegistrationEvents: jest.Mock<IAzureSearchResult<IEventMainInfo>>;
  toggleAssessmentsForL0Users: jest.Mock<IEventEntity>;
  toggleRegistrationForL0Users: jest.Mock<IEventEntity>;
}
