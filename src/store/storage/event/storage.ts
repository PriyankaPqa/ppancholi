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
import { IStore, IState } from '@/store/store.types';
import { IAzureSearchParams, IAzureSearchResult, EEventSummarySections } from '@/types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore<IState>): IStorage => ({
  getters: {
    agreementTypes(): Array<IOptionItem> {
      return store.getters['event/agreementTypes'];
    },

    eventTypes(): Array<IOptionItem> {
      return store.getters['event/eventTypes'];
    },

    events(): Array<IEvent> {
      return store.getters['event/events'];
    },

    eventsByStatus(statuses: Array<EEventStatus>) {
      return store.getters['event/eventsByStatus'](statuses);
    },

    eventById(id: uuid): IEvent {
      return store.getters['event/eventById'](id);
    },
  },

  actions: {
    fetchAgreementTypes(): Promise<IOptionItem[]> {
      return store.dispatch('event/fetchAgreementTypes');
    },

    fetchEventTypes(): Promise<IOptionItem[]> {
      return store.dispatch('event/fetchEventTypes');
    },

    fetchEvent(id: uuid): Promise<IEvent> {
      return store.dispatch('event/fetchEvent', id);
    },

    fetchEvents(): Promise<IEvent[]> {
      return store.dispatch('event/fetchEvents');
    },

    fetchOtherProvinces(): Promise<IAzureSearchResult<IOtherProvince>> {
      return store.dispatch('event/fetchOtherProvinces');
    },

    fetchRegions(): Promise<IAzureSearchResult<IRegion>> {
      return store.dispatch('event/fetchRegions');
    },

    searchEvents(params: IAzureSearchParams): Promise<IAzureSearchResult<IEvent>> {
      return store.dispatch('event/searchEvents', params);
    },

    createEvent(payload: IEvent): Promise<IEvent> {
      return store.dispatch('event/createEvent', payload);
    },

    updateEvent(payload: IEvent): Promise<IEvent> {
      return store.dispatch('event/updateEvent', payload);
    },

    updateEventSection({
      eventId, payload, section, action,
    } : {eventId: uuid, payload: IEventCallCentre | IEventAgreementInfos | IEventGenericLocation, section: EEventSummarySections, action: string})
      : Promise<IEvent> {
      return store.dispatch('event/updateEventSection', {
        eventId, payload, section, action,
      });
    },

    deleteAgreement({ eventId, agreementId }:{eventId: uuid, agreementId: uuid}): Promise<IEvent> {
      return store.dispatch('event/deleteAgreement', { eventId, agreementId });
    },

    toggleSelfRegistration(payload: { id: uuid; selfRegistrationEnabled: boolean }): Promise<IEvent> {
      return store.dispatch('event/toggleSelfRegistration', payload);
    },

    setEventStatus(payload: { event: IEvent, status: EEventStatus, reason: string }): Promise<IEvent> {
      return store.dispatch('event/setEventStatus', payload);
    },
  },
});
