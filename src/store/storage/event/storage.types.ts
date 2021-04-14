import {
  IEvent,
  IEventAgreement,
  IEventCallCentre,
  IEventGenericLocation,
  IOtherProvince,
  IRegion,
  IUpdateCallCentrePayload,
  IUpdateRegistrationLocationPayload,
  EEventStatus,
  IUpdateShelterLocationPayload,
  IUpdateAgreementPayload,
} from '@/entities/event';
import { IOptionItem } from '@/entities/optionItem';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface IStorage {
  getters: {
    agreementTypes(): Array<IOptionItem>;
    eventTypes(): Array<IOptionItem>;
    events(): Array<IEvent>;
    eventsByStatus(statuses: Array<EEventStatus>): Array<IEvent>;
    eventById(id:uuid): IEvent;
  }

  actions: {
    fetchEvent(id: uuid): Promise<IEvent>;
    fetchAgreementTypes(): Promise<IOptionItem[]>;
    fetchEventTypes(): Promise<IOptionItem[]>;
    fetchEvents(): Promise<IEvent[]>;
    fetchOtherProvinces(): Promise<IAzureSearchResult<IOtherProvince>>
    fetchRegions(): Promise<IAzureSearchResult<IRegion>>;
    searchEvents(params: IAzureSearchParams): Promise<IAzureSearchResult<IEvent>>;
    createEvent(payload: IEvent): Promise<IEvent>;
    updateEvent(payload: IEvent): Promise<IEvent>;
    addCallCentre({ eventId, payload }:{eventId: uuid, payload: IEventCallCentre}): Promise<IEvent>;
    editCallCentre({ eventId, payload }:{eventId: uuid, payload: IUpdateCallCentrePayload}): Promise<IEvent>;
    addAgreement({ eventId, payload }:{eventId: uuid, payload: IEventAgreement}): Promise<IEvent>;
    editAgreement({ eventId, payload }:{eventId: uuid, payload: IUpdateAgreementPayload}): Promise<IEvent>;
    deleteAgreement({ eventId, payload }:{eventId: uuid, payload: IEventAgreement}): Promise<IEvent>;
    addRegistrationLocation({ eventId, payload }:{eventId: uuid, payload: IEventGenericLocation}): Promise<IEvent>;
    editRegistrationLocation({ eventId, payload }:{eventId: uuid, payload: IUpdateRegistrationLocationPayload}): Promise<IEvent>;
    addShelterLocation({ eventId, payload }:{eventId: uuid, payload: IEventGenericLocation}): Promise<IEvent>;
    editShelterLocation({ eventId, payload }:{eventId: uuid, payload: IUpdateShelterLocationPayload}): Promise<IEvent>;
    toggleSelfRegistration(payload: { id: uuid; selfRegistrationEnabled: boolean }): Promise<IEvent>;
    setEventStatus(payload: { event: IEvent, status: EEventStatus, reason: string }): Promise<IEvent>;
  }
}

export interface IStorageMock {
  getters: {
    agreementTypes: jest.Mock<void>;
    eventTypes: jest.Mock<void>;
    events: jest.Mock<void>;
    eventsByStatus: jest.Mock<void>;
    eventById: jest.Mock<void>;
  }

  actions: {
    fetchAgreementTypes: jest.Mock<void>;
    fetchEventTypes: jest.Mock<void>;
    fetchEvent: jest.Mock<void>;
    fetchEvents: jest.Mock<void>;
    fetchOtherProvinces: jest.Mock<void>;
    fetchRegions: jest.Mock<void>;
    createEvent: jest.Mock<void>;
    updateEvent: jest.Mock<void>;
    addCallCentre: jest.Mock<void>;
    editCallCentre: jest.Mock<void>;
    addAgreement: jest.Mock<void>;
    editAgreement: jest.Mock<void>;
    deleteAgreement: jest.Mock<void>;
    addRegistrationLocation: jest.Mock<void>;
    editRegistrationLocation: jest.Mock<void>;
    addShelterLocation: jest.Mock<void>;
    editShelterLocation: jest.Mock<void>;
    toggleSelfRegistration: jest.Mock<void>;
    setEventStatus: jest.Mock<void>;
  }
}
