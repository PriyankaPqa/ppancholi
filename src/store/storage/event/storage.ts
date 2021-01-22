import { IEvent } from '@/entities/event';
import { IEventType } from '@/entities/eventType';
import { IStore } from '@/store/store.types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore): IStorage => ({
  getters: {
    eventTypes(): Array<IEventType> {
      return store.getters['event/eventTypes'];
    },
  },

  actions: {
    fetchEventTypes(): Promise<Array<IEventType>> {
      return store.dispatch('event/fetchEventTypes');
    },

    createEvent(payload: IEvent): Promise<IEvent> {
      return store.dispatch('event/createEvent', payload);
    },
  },
});
