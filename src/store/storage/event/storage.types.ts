import {
  IEventEntity,
  IEventMetadata,
  IEventAgreement,
  IEventCallCentre,
  IEventGenericLocation,
  IOtherProvince,
  IRegion,
  EEventStatus,
} from '@/entities/event';
import { IOptionItem } from '@/entities/optionItem';
import { IAzureSearchResult } from '@/types';
import { EEventSummarySections } from '@/types/enums/EEventSummarySections';
import {
  IBaseActions,
  IBaseActionsMock,
  IBaseGetters,
  IBaseGettersMock,
  IBaseMutations,
  IBaseMutationsMock,
} from '../base';

export interface IActions extends IBaseActions<IEventEntity, IEventMetadata, uuid> {
  fetchAgreementTypes(): Promise<IOptionItem[]>,
  fetchEventTypes(): Promise<IOptionItem[]>,
  fetchOtherProvinces(): Promise<IAzureSearchResult<IOtherProvince>>,
  fetchRegions(): Promise<IAzureSearchResult<IRegion>>,
  updateEventSection({
    eventId, payload, section, action,
  }:
    {eventId: uuid, payload: IEventCallCentre | IEventAgreement | IEventGenericLocation, section: EEventSummarySections, action: string})
    : Promise<IEventEntity>;
  deleteAgreement({ eventId, agreementId }:{eventId: uuid, agreementId: uuid}): Promise<IEventEntity>,
  toggleSelfRegistration(payload: { id: uuid, selfRegistrationEnabled: boolean }): Promise<IEventEntity>,
  setEventStatus(payload: { event: IEventEntity, status: EEventStatus, reason: string }): Promise<IEventEntity>,
  createEvent(event: IEventEntity): Promise<IEventEntity>,
  updateEvent(event: IEventEntity): Promise<IEventEntity>,
}

export interface IActionsMock extends IBaseActionsMock<IEventEntity, IEventMetadata> {
  fetchAgreementTypes: jest.Mock<void>,
  fetchEventTypes: jest.Mock<void>,
  fetchOtherProvinces: jest.Mock<void>,
  fetchRegions: jest.Mock<void>,
  updateEventSection: jest.Mock<IEventEntity>,
  deleteAgreement: jest.Mock<IEventEntity>,
  toggleSelfRegistration: jest.Mock<IEventEntity>,
  setEventStatus: jest.Mock<IEventEntity>,
  createEvent: jest.Mock<IEventEntity>,
  updateEvent: jest.Mock<IEventEntity>,
}

export interface IGetters extends IBaseGetters<IEventEntity, IEventMetadata> {
  agreementTypes(filterOutInactive?: boolean, actualValue?: string[] | string): Array<IOptionItem>,
  eventTypes(filterOutInactive?: boolean, actualValue?: string[] | string): Array<IOptionItem>,
  eventsByStatus(statuses: Array<EEventStatus>): Array<IEventEntity>,
}

export interface IGettersMock extends IBaseGettersMock<IEventEntity, IEventMetadata> {
  agreementTypes: jest.Mock<void>,
  eventTypes: jest.Mock<void>,
  eventsByStatus: jest.Mock<void>,
}

export interface IMutations extends IBaseMutations<IEventEntity, IEventMetadata> {
}

export interface IMutationsMock extends IBaseMutationsMock<IEventEntity, IEventMetadata> {
}

export interface IStorageMake {
  getters: IGetters;
  actions: IActions;
  mutations: IMutations;
}

export interface IStorageMakeMock {
  getters: IGettersMock;
  actions: IActionsMock;
  mutations: IMutationsMock;
}

export interface IStorage {
  make(): IStorageMake
}

export interface IStorageMock {
  make(): IStorageMake
}
