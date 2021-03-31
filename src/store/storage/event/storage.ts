import {
  IEvent, IEventCallCentre, IEventGenericLocation, IOtherProvince, IRegion, IUpdateCallCentrePayload, IUpdateRegistrationLocationPayload,
} from '@/entities/event';
import { IOptionItem } from '@/entities/optionItem';
import { IStore } from '@/store/store.types';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore): IStorage => ({
  getters: {
    eventTypes(): Array<IOptionItem> {
      return store.getters['event/eventTypes'];
    },

    events(): Array<IEvent> {
      return store.getters['event/events'];
    },

    openEvents() {
      return store.getters['event/openEvents'];
    },

    eventById(id: uuid): IEvent {
      return store.getters['event/eventById'](id);
    },
  },

  actions: {
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

    addCallCentre({ eventId, payload }:{eventId: uuid, payload: IEventCallCentre}): Promise<IEvent> {
      return store.dispatch('event/addCallCentre', { eventId, payload });
    },

    editCallCentre({ eventId, payload }:{eventId: uuid, payload: IUpdateCallCentrePayload}): Promise<IEvent> {
      return store.dispatch('event/editCallCentre', { eventId, payload });
    },

    addRegistrationLocation({ eventId, payload }:{eventId: uuid, payload: IEventGenericLocation}): Promise<IEvent> {
      return store.dispatch('event/addRegistrationLocation', { eventId, payload });
    },

    editRegistrationLocation({ eventId, payload }:{eventId: uuid, payload: IUpdateRegistrationLocationPayload}): Promise<IEvent> {
      return store.dispatch('event/editRegistrationLocation', { eventId, payload });
    },

    toggleSelfRegistration(payload: { id: uuid; selfRegistrationEnabled: boolean }): Promise<IEvent> {
      return store.dispatch('event/toggleSelfRegistration', payload);
    },
  },
});
