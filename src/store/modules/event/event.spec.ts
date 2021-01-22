import { Store } from 'vuex';
import { mockStore, IRootState } from '@/store';
import { EventType, mockEventTypeData } from '@/entities/eventType';
import { Event, mockEventsData } from '@/entities/event';

describe('>>> Event Module', () => {
  let store: Store<IRootState>;

  beforeEach(() => {
    store = mockStore({
      modules: {
        event: {
          state: {
            eventTypes: mockEventTypeData(),
            events: mockEventsData(),
          },
        },
      },
    });
  });

  describe('>> Getters', () => {
    test('the eventTypes getter returns an array of EventTypes', () => {
      const mockEventTypes = mockEventTypeData().map((e) => new EventType(e));

      expect(store.getters['event/eventTypes']).toEqual(mockEventTypes);
    });
  });

  describe('>> Mutations', () => {
    test('the setEventTypes mutation sets the event types array', () => {
      store = mockStore();

      expect(store.getters['event/eventTypes']).toEqual([]);

      store.commit('event/setEventTypes', mockEventTypeData());

      expect(store.state.event.eventTypes).toEqual(mockEventTypeData());
    });

    test('the addOrUpdateEvent mutation adds a new event to the state', () => {
      store = mockStore();

      const event = mockEventsData()[0];

      expect(store.state.event.events).toEqual([]);

      store.commit('event/addOrUpdateEvent', event);

      expect(store.state.event.events).toEqual([event]);
    });

    test('the addOrUpdateEvent mutation updates an existing event', () => {
      const events = mockEventsData();

      expect(store.state.event.events).toEqual(events);

      const updatedEvent = mockEventsData()[0];

      updatedEvent.name = {
        translation: {
          en: 'UPDATED EN',
          fr: 'UPDATED FR',
        },
      };

      store.commit('event/addOrUpdateEvent', updatedEvent);

      expect(store.state.event.events).toEqual([
        {
          ...events[0],
          name: {
            translation: {
              en: 'UPDATED EN',
              fr: 'UPDATED FR',
            },
          },
        },
        events[1],
      ]);
    });
  });

  describe('>> Actions', () => {
    test('the fetchEventTypes action calls the getEventsTypes service and returns the eventTypes', async () => {
      const store = mockStore();

      expect(store.$services.events.getEventTypes).toHaveBeenCalledTimes(0);

      const res = await store.dispatch('event/fetchEventTypes');

      expect(store.$services.events.getEventTypes).toHaveBeenCalledTimes(1);

      expect(store.state.event.eventTypes).toEqual(mockEventTypeData());

      expect(res).toEqual(mockEventTypeData());
    });

    test('if eventTypes already exist in the store, the getEventTypes action does not call the service', async () => {
      expect(store.$services.events.getEventTypes).toHaveBeenCalledTimes(0);

      const res = await store.dispatch('event/fetchEventTypes');

      expect(store.$services.events.getEventTypes).toHaveBeenCalledTimes(0);

      expect(res).toEqual(mockEventTypeData());
    });

    test('the createEvent action calls the createEvent service and returns the new Event entity', async () => {
      const store = mockStore();

      const newEvent = new Event(mockEventsData()[0]);

      expect(store.$services.events.createEvent).toHaveBeenCalledTimes(0);

      const res = await store.dispatch('event/createEvent', newEvent);

      expect(store.$services.events.createEvent).toHaveBeenCalledTimes(1);

      expect(res).toEqual(new Event(mockEventsData()[0]));

      expect(store.state.event.events.length).toBe(1);

      expect(store.state.event.events[0]).toEqual(mockEventsData()[0]);
    });
  });
});
