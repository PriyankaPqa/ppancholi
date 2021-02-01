import { Store } from 'vuex';
import _sortBy from 'lodash/sortBy';
import { mockStore, IRootState } from '@/store';
import { EventType, mockEventTypeData } from '@/entities/eventType';
import { Event, mockEventsData } from '@/entities/event';
import helpers from '@/ui/helpers';

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
    describe('eventTypes', () => {
      test('the eventTypes getter returns an array of EventTypes sorted by orderRank', () => {
        const mockEventTypes = mockEventTypeData().map((e) => new EventType(e));

        expect(store.getters['event/eventTypes']).toEqual(_sortBy(mockEventTypes, 'orderRank'));
      });
    });

    describe('events', () => {
      test('the events getter returns an array of Events sorted by name', () => {
        const mockEvents = mockEventsData().map((e) => new Event(e));

        expect(store.getters['event/events']).toEqual(helpers.sortMultilingualArray(mockEvents, 'name'));
      });
    });
  });

  describe('>> Mutations', () => {
    describe('setEventTypes', () => {
      test('the setEventTypes mutation sets the event types array', () => {
        store = mockStore();

        expect(store.getters['event/eventTypes']).toEqual([]);

        store.commit('event/setEventTypes', mockEventTypeData());

        expect(store.state.event.eventTypes).toEqual(mockEventTypeData());
      });
    });

    describe('setEvents', () => {
      test('the setEvents mutation sets the events array', () => {
        store = mockStore();

        expect(store.getters['event/events']).toEqual([]);

        store.commit('event/setEvents', mockEventsData());

        expect(store.state.event.events).toEqual(mockEventsData());
      });
    });

    describe('addOrUpdateEvent', () => {
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
  });

  describe('>> Actions', () => {
    describe('fetchEventTypes', () => {
      test('the fetchEventTypes action calls the getEventsTypes service and returns the eventTypes getter', async () => {
        const store = mockStore();

        expect(store.$services.events.getEventTypes).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('event/fetchEventTypes');

        expect(store.$services.events.getEventTypes).toHaveBeenCalledTimes(1);

        expect(store.state.event.eventTypes).toEqual(mockEventTypeData());

        expect(res).toEqual(store.getters['event/eventTypes']);
      });

      test('if the getEventTypes action has already been called it will not call the service again', async () => {
        expect(store.$services.events.getEventTypes).toHaveBeenCalledTimes(0);

        await store.dispatch('event/fetchEventTypes');

        expect(store.$services.events.getEventTypes).toHaveBeenCalledTimes(1);

        await store.dispatch('event/fetchEventTypes');

        expect(store.$services.events.getEventTypes).toHaveBeenCalledTimes(1);
      });
    });

    describe('fetchEvents', () => {
      test('the fetchEvents action calls the getEvents service and returns the events getter', async () => {
        const store = mockStore();

        expect(store.$services.events.getEvents).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('event/fetchEvents');

        expect(store.$services.events.getEvents).toHaveBeenCalledTimes(1);

        expect(store.state.event.events).toEqual(mockEventsData());

        expect(res).toEqual(store.getters['event/events']);
      });

      test('if the getEvents action has already been called it will not call the service again', async () => {
        expect(store.$services.events.getEvents).toHaveBeenCalledTimes(0);

        await store.dispatch('event/fetchEvents');

        expect(store.$services.events.getEvents).toHaveBeenCalledTimes(1);

        await store.dispatch('event/fetchEvents');

        expect(store.$services.events.getEvents).toHaveBeenCalledTimes(1);
      });
    });

    describe('createEvent', () => {
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
});
