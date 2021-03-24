import { Store } from 'vuex';
import _sortBy from 'lodash/sortBy';
import { mockStore, IRootState } from '@/store';
import {
  OptionItem, mockOptionItemData, EOptionListItemStatus, EOptionLists,
} from '@/entities/optionItem';
import { Event, IEvent, mockEventsSearchData } from '@/entities/event';
import helpers from '@/ui/helpers';
import { mockSearchParams } from '@/test/helpers';

jest.mock('@/store/modules/event/utils');
describe('>>> Event Module', () => {
  let store: Store<IRootState>;

  const mockEvents = (): IEvent[] => mockEventsSearchData().map((ev) => new Event(ev));

  beforeEach(() => {
    store = mockStore({
      modules: {
        event: {
          state: {
            eventTypes: mockOptionItemData(),
            events: mockEvents(),
            searchLoading: false,
          },
        },
      },
    });
  });

  describe('>> Getters', () => {
    describe('eventTypes', () => {
      test('the eventTypes getter returns an array of EventTypes sorted by orderRank and filtered by status', () => {
        const mockEventTypes = mockOptionItemData().map((e) => new OptionItem(e));

        expect(store.getters['event/eventTypes']).toEqual(
          _sortBy(mockEventTypes, 'orderRank').filter((i) => i.status === EOptionListItemStatus.Active),
        );
      });
    });

    describe('events', () => {
      test('the events getter returns an array of Events sorted by name', () => {
        const mockEvents = mockEventsSearchData().map((e) => new Event(e));

        expect(store.getters['event/events']).toEqual(helpers.sortMultilingualArray(mockEvents, 'name'));
      });
    });

    describe('eventById', () => {
      test('the getter returns the event with the id passed in the argument', () => {
        const mockId = mockEvents()[0].id;
        expect(store.getters['event/eventById'](mockId)).toEqual(mockEvents()[0]);
      });

      test('the getter return null if the id passed in argument does not correspond to an event', () => {
        const mockId = 'foo';
        expect(store.getters['event/eventById'](mockId)).toEqual(null);
      });
    });
  });

  describe('>> Mutations', () => {
    describe('setEventTypes', () => {
      test('the setEventTypes mutation sets the event types array', () => {
        store = mockStore();

        expect(store.getters['event/eventTypes']).toEqual([]);

        store.commit('event/setEventTypes', mockOptionItemData());

        expect(store.state.event.eventTypes).toEqual(mockOptionItemData());
      });
    });

    describe('setEvents', () => {
      test('the setEvents mutation sets the events array', () => {
        store = mockStore();

        expect(store.getters['event/events']).toEqual([]);

        store.commit('event/setEvents', mockEvents());

        expect(store.state.event.events).toEqual(mockEvents());
      });
    });

    describe('addOrUpdateEvent', () => {
      test('the addOrUpdateEvent mutation adds a new event to the state', () => {
        store = mockStore();

        const event = mockEvents()[0];

        expect(store.state.event.events).toEqual([]);

        store.commit('event/addOrUpdateEvent', event);

        expect(store.state.event.events).toEqual([event]);
      });

      test('the addOrUpdateEvent mutation updates an existing event', () => {
        const events = mockEvents();

        expect(store.state.event.events).toEqual(events);

        const updatedEvent = mockEvents()[0];

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
        ]);
      });
    });

    describe('setGetLoading', () => {
      test('the setGetLoading mutation sets the getLoading state', () => {
        store = mockStore();

        store.commit('event/setGetLoading', true);

        expect(store.state.event.getLoading).toBeTruthy();
      });
    });

    describe('setSearchLoading', () => {
      test('the setSearchLoading mutation sets the searchLoading state', () => {
        store = mockStore();

        store.commit('event/setSearchLoading', true);

        expect(store.state.event.searchLoading).toBeTruthy();
      });
    });
  });

  describe('>> Actions', () => {
    describe('fetchEventTypes', () => {
      test('the fetchEventTypes action calls the getEventsTypes service and returns the eventTypes getter', async () => {
        const store = mockStore();

        expect(store.$services.optionItems.getOptionList).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('event/fetchEventTypes');

        expect(store.$services.optionItems.getOptionList).toHaveBeenCalledWith(EOptionLists.EventTypes);

        expect(store.state.event.eventTypes).toEqual(mockOptionItemData());

        expect(res).toEqual(store.getters['event/eventTypes']);
      });

      // Disable caching until signalR events implemented
      // test('if the getEventTypes action has already been called it will not call the service again', async () => {
      //   expect(store.$services.eventTypes.getEventTypes).toHaveBeenCalledTimes(0);

      //   await store.dispatch('event/fetchEventTypes');

      //   expect(store.$services.eventTypes.getEventTypes).toHaveBeenCalledTimes(1);

      //   await store.dispatch('event/fetchEventTypes');

      //   expect(store.$services.eventTypes.getEventTypes).toHaveBeenCalledTimes(1);
      // });
    });

    describe('fetchEvent', () => {
      test('the fetchEvent action calls the getEventById service and returns the event', async () => {
        const store = mockStore();
        const event = new Event(mockEventsSearchData()[0]);

        expect(store.$services.events.searchEvents).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('event/fetchEvent', event.id);

        expect(store.$services.events.searchEvents).toHaveBeenCalledWith({ filter: { EventId: event.id } });

        expect(store.state.event.events).toEqual([
          event,
        ]);

        expect(res).toEqual(event);
      });

      // test('if the event already exists in the store, do not call the API', async () => { TODO caching disabled
      //   const store = mockStore();
      //   const event = mockEvents()[0];

      //   expect(store.$services.events.searchEvents).toHaveBeenCalledTimes(0);

      //   await store.dispatch('event/fetchEvent', event.id);

      //   expect(store.$services.events.searchEvents).toHaveBeenCalledTimes(1);

      //   await store.dispatch('event/fetchEvent', event.id);

      //   expect(store.$services.events.searchEvents).toHaveBeenCalledTimes(1);
      // });
    });

    describe('fetchEvents', () => {
      test('the fetchEvents action calls the getEvents service and returns the events getter', async () => {
        const store = mockStore();

        expect(store.$services.events.searchEvents).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('event/fetchEvents');

        expect(store.$services.events.searchEvents).toHaveBeenCalledWith({});

        expect(store.state.event.events).toEqual(mockEvents());

        expect(res).toEqual(store.getters['event/events']);
      });

      test('if the getEvents action has already been called it will not call the service again', async () => {
        expect(store.$services.events.searchEvents).toHaveBeenCalledTimes(0);

        await store.dispatch('event/fetchEvents');

        expect(store.$services.events.searchEvents).toHaveBeenCalledTimes(1);

        await store.dispatch('event/fetchEvents');

        expect(store.$services.events.searchEvents).toHaveBeenCalledTimes(1);
      });
    });

    describe('searchEvents', () => {
      test('it calls the service with the passed params', async () => {
        expect(store.$services.events.searchEvents).toHaveBeenCalledTimes(0);

        const params = mockSearchParams;
        await store.dispatch('event/searchEvents', params);

        expect(store.$services.events.searchEvents).toHaveBeenCalledWith(params);
      });
    });

    describe('createEvent', () => {
      test('the createEvent action calls the createEvent service and returns the new Event entity', async () => {
        const store = mockStore();

        const newEvent = mockEvents()[0];

        expect(store.$services.events.createEvent).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('event/createEvent', newEvent);

        expect(store.$services.events.createEvent).toHaveBeenCalledTimes(1);

        expect(res).toEqual(newEvent);

        expect(store.state.event.events.length).toBe(1);

        expect(store.state.event.events[0]).toEqual(newEvent);
      });
    });
  });
});
