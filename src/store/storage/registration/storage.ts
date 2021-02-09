import { ISearchData } from '@/types';
import { IEvent } from '@/entities/event';
import { IStore } from '@/store/store.types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore): IStorage => ({
  getters: {
    event(): IEvent {
      return store.getters['registration/event'];
    },
  },

  actions: {
    fetchEvent(params: ISearchData): Promise<IEvent> {
      return store.dispatch('registration/fetchEvent', params);
    },
  },
});
