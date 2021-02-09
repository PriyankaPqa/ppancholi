import { Store } from 'vuex';
import { mockStore, IRootState } from '@/store';
import { Event, mockEventsData } from '@/entities/event';

describe('>>> Event Module', () => {
  let store: Store<IRootState>;
  const mockEventData = mockEventsData()[0];

  beforeEach(() => {
    store = mockStore();
  });

  describe('>> Getters', () => {
    describe('event', () => {
      test('it returns a default event', () => {
        expect(store.getters['registration/event']).toEqual(new Event());
      });
    });
  });

  describe('>> Mutations', () => {
    describe('setEvent', () => {
      test('it sets the event', () => {
        expect(store.getters['registration/event']).toEqual(new Event());

        store.commit('registration/setEvent', mockEventData);

        expect(store.state.registration.event).toEqual(mockEventData);
      });
    });
  });

  describe('>> Actions', () => {
    describe('fetchEvent', () => {
      test('it calls the getEvent service', async () => {
        expect(store.$services.events.searchEvents).toHaveBeenCalledTimes(0);

        await store.dispatch('registration/fetchEvent');

        expect(store.$services.events.searchEvents).toHaveBeenCalledTimes(1);
      });
      test('it maps IEventData to IEvent, and sets the event', async () => {
        expect(store.getters['registration/event']).toEqual(new Event());

        await store.dispatch('registration/fetchEvent');

        expect(store.getters['registration/event']).toEqual(new Event(mockEventData));
      });
    });
  });
});
