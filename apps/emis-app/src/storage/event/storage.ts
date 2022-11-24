import {
  IEventEntity,
  IEventMetadata,
  IEventAgreement,
  IEventCallCentre,
  IEventGenericLocation,
  EEventStatus,
  EventEntity,
  IEventLocation,
} from '@libs/entities-lib/event';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { IStore, IState } from '@/store/store.types';
import { EEventSummarySections } from '@/types';
import { Base } from '../base';
import { IStorage } from './storage.types';

export class EventStorage
  extends Base<IEventEntity, IEventMetadata, uuid> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    super(pStore, pEntityModuleName, pMetadataModuleName);
  }

  private getters = {
    ...this.baseGetters,

    // eslint-disable-next-line vue/max-len,max-len
    agreementTypes: (filterOutInactive = true, actualValue?: string[] | string): Array<IOptionItem> => this.store.getters[`${this.entityModuleName}/agreementTypes`](filterOutInactive, actualValue),

    // eslint-disable-next-line vue/max-len,max-len
    eventTypes: (filterOutInactive = true, actualValue?: string[] | string): Array<IOptionItem> => this.store.getters[`${this.entityModuleName}/eventTypes`](filterOutInactive, actualValue),

    eventsByStatus: (statuses: Array<EEventStatus>): Array<IEventEntity> => this.store.getters[`${this.entityModuleName}/eventsByStatus`](statuses),
  };

  private actions = {
    ...this.baseActions,

    fetchAgreementTypes: (): Promise<IOptionItem[]> => this.store.dispatch(`${this.entityModuleName}/fetchAgreementTypes`),

    fetchEventTypes: (): Promise<IOptionItem[]> => this.store.dispatch(`${this.entityModuleName}/fetchEventTypes`),

    fetchOtherProvinces: (): Promise<IEventLocation[]> => this.store.dispatch(`${this.entityModuleName}/fetchOtherProvinces`),

    fetchRegions: (): Promise<IEventLocation[]> => this.store.dispatch(`${this.entityModuleName}/fetchRegions`),

    updateEventSection: ({
      eventId, payload, section, action,
    } : { eventId: uuid, payload: IEventCallCentre | IEventAgreement | IEventGenericLocation, section: EEventSummarySections, action: string })
      : Promise<IEventEntity> => this.store.dispatch(`${this.entityModuleName}/updateEventSection`, {
      eventId, payload, section, action,
    }),

    deleteAgreement: ({ eventId, agreementId }:{ eventId: uuid, agreementId: uuid })
    : Promise<IEventEntity> => this.store.dispatch(`${this.entityModuleName}/deleteAgreement`, { eventId, agreementId }),

    // eslint-disable-next-line
    toggleSelfRegistration: (payload: { id: uuid; selfRegistrationEnabled: boolean }): Promise<IEventEntity> => this.store.dispatch(`${this.entityModuleName}/toggleSelfRegistration`, payload),

    // eslint-disable-next-line
    setEventStatus: (payload: { event: EventEntity, status: EEventStatus, reason: string }): Promise<IEventEntity> => this.store.dispatch(`${this.entityModuleName}/setEventStatus`, payload),

    createEvent: (event: IEventEntity): Promise<IEventEntity> => this.store.dispatch(`${this.entityModuleName}/createEvent`, event),

    updateEvent: (event: IEventEntity): Promise<IEventEntity> => this.store.dispatch(`${this.entityModuleName}/updateEvent`, event),
  };

  private mutations = {
    ...this.baseMutations,

    setAgreementTypesFetched: (payload: boolean) => this.store.commit(`${this.entityModuleName}/setAgreementTypesFetched`, payload),

    setEventTypesFetched: (payload: boolean) => this.store.commit(`${this.entityModuleName}/setEventTypesFetched`, payload),
  };

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  });
}
