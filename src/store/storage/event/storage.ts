import {
  IEventEntity,
  IEventMetadata,
  IEventAgreement,
  IEventCallCentre,
  IEventGenericLocation,
  IOtherProvince,
  IRegion,
  EEventStatus,
  EventEntity,
} from '@/entities/event';
import { IOptionItem } from '@/entities/optionItem';
import { IStore, IState } from '@/store/store.types';
import { EEventSummarySections, IAzureSearchResult } from '@/types';
import { Base } from '../base';
import { IStorage } from './storage.types';

export class EventStorage
  extends Base<IEventEntity, IEventMetadata> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    super(pStore, pEntityModuleName, pMetadataModuleName);
  }

  private getters = {
    ...this.baseGetters,

    // eslint-disable-next-line max-len
    agreementTypes: (filterOutInactive = true, actualValue?: string[] | string): Array<IOptionItem> => this.store.getters[`${this.entityModuleName}/agreementTypes`](filterOutInactive, actualValue),

    // eslint-disable-next-line max-len
    eventTypes: (filterOutInactive = true, actualValue?: string[] | string): Array<IOptionItem> => this.store.getters[`${this.entityModuleName}/eventTypes`](filterOutInactive, actualValue),

    eventsByStatus: (statuses: Array<EEventStatus>): Array<IEventEntity> => this.store.getters[`${this.entityModuleName}/eventsByStatus`](statuses),
  }

  private actions = {
    ...this.baseActions,

    fetchAgreementTypes: (): Promise<IOptionItem[]> => this.store.dispatch(`${this.entityModuleName}/fetchAgreementTypes`),

    fetchEventTypes: (): Promise<IOptionItem[]> => this.store.dispatch(`${this.entityModuleName}/fetchEventTypes`),

    fetchOtherProvinces: (): Promise<IAzureSearchResult<IOtherProvince>> => this.store.dispatch(`${this.entityModuleName}/fetchOtherProvinces`),

    fetchRegions: (): Promise<IAzureSearchResult<IRegion>> => this.store.dispatch(`${this.entityModuleName}/fetchRegions`),

    updateEventSection: ({
      eventId, payload, section, action,
    } : {eventId: uuid, payload: IEventCallCentre | IEventAgreement | IEventGenericLocation, section: EEventSummarySections, action: string})
      : Promise<IEventEntity> => this.store.dispatch(`${this.entityModuleName}/updateEventSection`, {
      eventId, payload, section, action,
    }),

    deleteAgreement: ({ eventId, agreementId }:{eventId: uuid, agreementId: uuid})
    : Promise<IEventEntity> => this.store.dispatch(`${this.entityModuleName}/deleteAgreement`, { eventId, agreementId }),

    // eslint-disable-next-line
    toggleSelfRegistration: (payload: { id: uuid; selfRegistrationEnabled: boolean }): Promise<IEventEntity> => this.store.dispatch(`${this.entityModuleName}/toggleSelfRegistration`, payload),

    // eslint-disable-next-line
    setEventStatus: (payload: { event: EventEntity, status: EEventStatus, reason: string }): Promise<IEventEntity> => this.store.dispatch(`${this.entityModuleName}/setEventStatus`, payload),

    createEvent: (event: IEventEntity): Promise<IEventEntity> => this.store.dispatch(`${this.entityModuleName}/createEvent`, event),

    updateEvent: (event: IEventEntity): Promise<IEventEntity> => this.store.dispatch(`${this.entityModuleName}/updateEvent`, event),
  }

  private mutations = {
    ...this.baseMutations,
  }

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  })
}
