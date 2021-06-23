import {
  IEvent,
  IEventCallCentre,
  IEventGenericLocation,
  IOtherProvince,
  IRegion,
  EEventStatus,
  IEventAgreementInfos,
} from '@/entities/event';
import { IOptionItem } from '@/entities/optionItem';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { EEventSummarySections } from '../../../types/enums/EEventSummarySections';

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
    updateEventSection({
      eventId, payload, section, action,
    }:
      {eventId: uuid, payload: IEventCallCentre | IEventAgreementInfos | IEventGenericLocation, section: EEventSummarySections, action: string})
      : Promise<IEvent>;
    deleteAgreement({ eventId, agreementId }:{eventId: uuid, agreementId: uuid}): Promise<IEvent>;
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
    updateEventSection: jest.Mock<void>;
    deleteAgreement: jest.Mock<void>;
    toggleSelfRegistration: jest.Mock<void>;
    setEventStatus: jest.Mock<void>;
  }
}
