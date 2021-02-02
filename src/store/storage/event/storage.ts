import { IEvent, IOtherProvince, IRegion } from '@/entities/event';
import { IEventType } from '@/entities/eventType';
import { IStore } from '@/store/store.types';
import { ISearchData } from '@/types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore): IStorage => ({
  getters: {
    eventTypes(): Array<IEventType> {
      return store.getters['event/eventTypes'];
    },

    events(): Array<IEvent> {
      return store.getters['event/events'];
    },
  },

  actions: {
    fetchEventTypes(): Promise<IEventType[]> {
      return store.dispatch('event/fetchEventTypes');
    },

    fetchEvents(): Promise<IEvent[]> {
      return store.dispatch('event/fetchEvents');
    },

    fetchOtherProvinces(): Promise<IOtherProvince[]> {
      return store.dispatch('event/fetchOtherProvinces');
    },

    fetchRegions(): Promise<IRegion[]> {
      return store.dispatch('event/fetchRegions');
    },

    searchEvents(params: ISearchData): Promise<IEvent[]> {
      return store.dispatch('event/searchEvents', params);
    },

    createEvent(payload: IEvent): Promise<IEvent> {
      return store.dispatch('event/createEvent', payload);
    },
  },
});
