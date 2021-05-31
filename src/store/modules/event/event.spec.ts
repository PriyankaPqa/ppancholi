import { Store } from 'vuex';
import _sortBy from 'lodash/sortBy';
import { mockStore, IRootState } from '@/store';
import {
  OptionItem, mockOptionItemData, EOptionListItemStatus, EOptionLists,
} from '@/entities/optionItem';
import {
  Event, IEvent, IEventAgreement, IEventCallCentre, IEventGenericLocation, mockEventsSearchData, mockSearchEvents, EEventStatus,
} from '@/entities/event';
import helpers from '@/ui/helpers';
import { mockSearchParams } from '@/test/helpers';

jest.mock('@/store/modules/event/eventUtils');

describe('>>> Event Module', () => {
  let store: Store<IRootState>;

  const mockEvents = (): IEvent[] => mockEventsSearchData().map((ev) => new Event(ev));

  beforeEach(() => {
    store = mockStore({
      modules: {
        event: {
          state: {
            agreementTypes: mockOptionItemData(),
            eventTypes: mockOptionItemData(),
            events: mockEvents(),
            searchLoading: false,
            agreementTypesFetched: false,
          },
        },
      },
    });
  });

  describe('>> Getters', () => {
    describe('agreementTypes', () => {
      it('returns an array of agreementTypes sorted by orderRank and filtered by status', () => {
        const mockAgreementTypes = mockOptionItemData().map((e) => new OptionItem(e));

        expect(store.getters['event/agreementTypes']).toEqual(
          _sortBy(mockAgreementTypes, 'orderRank').filter((i) => i.status === EOptionListItemStatus.Active),
        );
      });
    });

    describe('eventTypes', () => {
      it('returns an array of EventTypes sorted by orderRank and filtered by status', () => {
        const mockEventTypes = mockOptionItemData().map((e) => new OptionItem(e));

        expect(store.getters['event/eventTypes']).toEqual(
          _sortBy(mockEventTypes, 'orderRank').filter((i) => i.status === EOptionListItemStatus.Active),
        );
      });
    });

    describe('events', () => {
      it('returns an array of Events sorted by name', () => {
        const mockEvents = mockEventsSearchData().map((e) => new Event(e));

        expect(store.getters['event/events']).toEqual(helpers.sortMultilingualArray(mockEvents, 'name'));
      });
    });

    describe('eventsByStatus', () => {
      it('returns an array of Events sorted by name and filtered by statuses', () => {
        const activeEvents = [mockEventsSearchData()[1]].map((e) => new Event(e));

        expect(store.getters['event/eventsByStatus']([EEventStatus.Open])).toEqual(helpers.sortMultilingualArray(activeEvents, 'name'));
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
    describe('setAgreementTypes', () => {
      it('sets the agreement types array', () => {
        store = mockStore();

        expect(store.getters['event/agreementTypes']).toEqual([]);

        store.commit('event/setAgreementTypes', mockOptionItemData());

        expect(store.state.event.agreementTypes).toEqual(mockOptionItemData());
      });
    });
    describe('setEventTypes', () => {
      it('sets the event types array', () => {
        store = mockStore();

        expect(store.getters['event/eventTypes']).toEqual([]);

        store.commit('event/setEventTypes', mockOptionItemData());

        expect(store.state.event.eventTypes).toEqual(mockOptionItemData());
      });
    });

    describe('setEvents', () => {
      it('sets the events array', () => {
        store = mockStore();

        expect(store.getters['event/events']).toEqual([]);

        store.commit('event/setEvents', mockEvents());

        expect(store.state.event.events).toEqual(mockEvents());
      });
    });

    describe('addOrUpdateEvent', () => {
      it('adds a new event to the state', () => {
        store = mockStore();

        const event = mockEvents()[0];

        expect(store.state.event.events).toEqual([]);

        store.commit('event/addOrUpdateEvent', event);

        expect(store.state.event.events).toEqual([event]);
      });

      it('updates an existing event', () => {
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
          new Event(mockEventsSearchData()[1]),
        ]);
      });
    });

    describe('setAgreementTypesFetched', () => {
      test('the setAgreementTypesFetched mutation sets the agreementTypesFetched state', () => {
        store = mockStore();

        store.commit('event/setAgreementTypesFetched', true);

        expect(store.state.event.agreementTypesFetched).toBeTruthy();
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

    describe('setEventSelfRegistrationEnabled', () => {
      it('sets the value of self registration on the provided entity', () => {
        const events = mockSearchEvents().value.map((e) => new Event(e));

        const store = mockStore({
          modules: {
            event: {
              state: {
                events,
              },
            },
          },
        });

        expect(store.state.event.events[0].selfRegistrationEnabled).toBe(false);

        store.commit('event/setEventSelfRegistrationEnabled', {
          id: events[0].id,
          selfRegistrationEnabled: true,
        });

        expect(store.state.event.events[0].selfRegistrationEnabled).toBe(true);
      });
    });
  });

  describe('>> Actions', () => {
    describe('fetchAgreementTypes', () => {
      it('calls the getAgreementTypes service and returns the eventTypes getter', async () => {
        const store = mockStore();

        expect(store.$services.optionItems.getOptionList).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('event/fetchAgreementTypes');

        expect(store.$services.optionItems.getOptionList).toHaveBeenCalledWith(EOptionLists.AgreementTypes);

        expect(store.state.event.agreementTypes).toEqual(mockOptionItemData());

        expect(res).toEqual(store.getters['event/agreementTypes']);
      });
    });

    describe('fetchEventTypes', () => {
      it('calls the getEventsTypes service and returns the eventTypes getter', async () => {
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
      it('calls the searchEvents service and returns the event', async () => {
        const store = mockStore();
        const event = new Event(mockEventsSearchData()[0]);

        jest.spyOn(store.$services.events, 'searchEvents').mockReturnValueOnce(mockSearchEvents(0));

        expect(store.$services.events.searchEvents).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('event/fetchEvent', event.id);

        expect(store.$services.events.searchEvents).toHaveBeenCalledWith({ filter: { EventId: event.id } });

        expect(store.state.event.events).toEqual([
          event,
        ]);

        expect(res).toEqual(event);
      });

      test('if the event already exists in the store, do not call the API', async () => {
        const store = mockStore();
        const event = new Event(mockEventsSearchData()[0]);
        jest.spyOn(store.$services.events, 'searchEvents').mockReturnValueOnce(mockSearchEvents(0));

        expect(store.$services.events.searchEvents).toHaveBeenCalledTimes(0);

        await store.dispatch('event/fetchEvent', event.id);

        expect(store.$services.events.searchEvents).toHaveBeenCalledTimes(1);

        await store.dispatch('event/fetchEvent', event.id);

        expect(store.$services.events.searchEvents).toHaveBeenCalledTimes(1);
      });
    });

    describe('fetchEvents', () => {
      it('calls the searchEvents service and returns the events getter', async () => {
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
      it('calls the service with the passed params', async () => {
        expect(store.$services.events.searchEvents).toHaveBeenCalledTimes(0);

        const params = mockSearchParams;
        await store.dispatch('event/searchEvents', params);

        expect(store.$services.events.searchEvents).toHaveBeenCalledWith(params);
      });
    });

    describe('createEvent', () => {
      it('calls the createEvent service and returns the new Event entity', async () => {
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

    describe('addCallCentre', () => {
      it('calls the addCallCentre service and returns the new Event entity', async () => {
        const store = mockStore();

        const event = mockEvents()[0];
        const callCentre = event.callCentres[0];

        expect(store.$services.events.addCallCentre).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('event/addCallCentre', { eventId: event.id, payload: callCentre });

        expect(store.$services.events.addCallCentre).toHaveBeenCalledTimes(1);
        expect(store.$services.events.addCallCentre).toHaveBeenCalledWith(event.id, callCentre);

        expect(res).toEqual(event);

        expect(store.state.event.events[0]).toEqual(event);
      });
    });

    describe('editCallCentre', () => {
      it('calls the editCallCentre service and returns the new Event entity', async () => {
        const store = mockStore();

        const event = mockEvents()[0];
        const callCentre1 = event.callCentres[0];
        const callCentre2 = { ...callCentre1, startDate: null } as IEventCallCentre;
        const payload = { originalCallCentre: callCentre1, updatedCallCentre: callCentre2 };

        expect(store.$services.events.editCallCentre).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('event/editCallCentre', {
          eventId: event.id,
          payload,
        });

        expect(store.$services.events.editCallCentre).toHaveBeenCalledTimes(1);
        expect(store.$services.events.editCallCentre).toHaveBeenCalledWith(event.id, payload);

        expect(res).toEqual(event);

        expect(store.state.event.events[0]).toEqual(event);
      });
    });

    describe('toggleSelfRegistration', () => {
      it('calls the setEventSelfRegistration service', async () => {
        const events = mockSearchEvents().value.map((e) => new Event(e));

        const store = mockStore({
          modules: {
            event: {
              state: {
                events,
              },
            },
          },
        });

        expect(store.state.event.events[0].selfRegistrationEnabled).toBe(false);

        await store.dispatch('event/toggleSelfRegistration', {
          id: events[0].id,
          selfRegistrationEnabled: true,
        });

        expect(store.$services.events.toggleSelfRegistration).toHaveBeenCalledTimes(1);
        expect(store.$services.events.toggleSelfRegistration).toHaveBeenCalledWith(events[0].id, true);

        expect(store.state.event.events[0].selfRegistrationEnabled).toBe(true);
      });
    });

    describe('setEventStatus', () => {
      it('calls the setEventStatus service', async () => {
        const events = mockSearchEvents().value.map((e) => new Event(e));

        const store = mockStore();

        await store.dispatch('event/setEventStatus', {
          event: events[0],
          status: EEventStatus.Open,
          reason: 're-open',
        });

        expect(store.$services.events.setEventStatus).toHaveBeenCalledTimes(1);
        expect(store.$services.events.setEventStatus).toHaveBeenCalledWith(events[0].id, EEventStatus.Open, true, 're-open');
      });
    });

    describe('addAgreement', () => {
      it('calls the addAgreement service and returns the new Event entity', async () => {
        const store = mockStore();

        const event = mockEvents()[0];
        const agreement = event.agreements[0];

        expect(store.$services.events.addAgreement).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('event/addAgreement', { eventId: event.id, payload: agreement });

        expect(store.$services.events.addAgreement).toHaveBeenCalledTimes(1);
        expect(store.$services.events.addAgreement).toHaveBeenCalledWith(event.id, agreement);

        expect(res).toEqual(event);

        expect(store.state.event.events[0]).toEqual(event);
      });
    });

    describe('editAgreement', () => {
      it('calls the editAgreement service and returns the new Event entity', async () => {
        const store = mockStore();

        const event = mockEvents()[0];
        const agreement1 = event.agreements[0];
        const agreement2 = { ...agreement1, startDate: null } as IEventAgreement;
        const payload = { originalAgreement: agreement1, updatedAgreement: agreement2 };

        expect(store.$services.events.editAgreement).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('event/editAgreement', { eventId: event.id, payload });

        expect(store.$services.events.editAgreement).toHaveBeenCalledTimes(1);
        expect(store.$services.events.editAgreement).toHaveBeenCalledWith(event.id, payload);

        expect(res).toEqual(event);

        expect(store.state.event.events[0]).toEqual(event);
      });
    });

    describe('deleteAgreement', () => {
      it('calls the removeAgreement service and returns the new Event entity', async () => {
        const store = mockStore();

        const event = mockEvents()[0];
        const agreement = event.agreements[0];

        expect(store.$services.events.removeAgreement).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('event/deleteAgreement', { eventId: event.id, payload: agreement });

        expect(store.$services.events.removeAgreement).toHaveBeenCalledTimes(1);
        expect(store.$services.events.removeAgreement).toHaveBeenCalledWith(event.id, agreement);

        expect(res).toEqual(event);

        expect(store.state.event.events[0]).toEqual(event);
      });
    });

    describe('addRegistrationLocation', () => {
      it('calls the addRegistrationLocation service and returns the new Event entity', async () => {
        const store = mockStore();

        const event = mockEvents()[0];
        const location = event.registrationLocations[0];

        expect(store.$services.events.addRegistrationLocation).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('event/addRegistrationLocation', { eventId: event.id, payload: location });

        expect(store.$services.events.addRegistrationLocation).toHaveBeenCalledTimes(1);
        expect(store.$services.events.addRegistrationLocation).toHaveBeenCalledWith(event.id, location);

        expect(res).toEqual(event);

        expect(store.state.event.events[0]).toEqual(event);
      });
    });

    describe('editRegistrationLocation', () => {
      it('calls the editRegistrationLocation service and returns the new Event entity', async () => {
        const store = mockStore();

        const event = mockEvents()[0];
        const originalRegistrationLocation = event.registrationLocations[0];
        const updatedRegistrationLocation = {
          ...originalRegistrationLocation,
          address: {
            city: 'Laval',
          },
        } as IEventGenericLocation;
        const payload = { originalRegistrationLocation, updatedRegistrationLocation };

        expect(store.$services.events.editRegistrationLocation).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('event/editRegistrationLocation', {
          eventId: event.id,
          payload,
        });

        expect(store.$services.events.editRegistrationLocation).toHaveBeenCalledTimes(1);
        expect(store.$services.events.editRegistrationLocation).toHaveBeenCalledWith(event.id, payload);

        expect(res).toEqual(event);

        expect(store.state.event.events[0]).toEqual(event);
      });
    });

    describe('addShelterLocation', () => {
      it('calls the addShelterLocation service and returns the new Event entity', async () => {
        const store = mockStore();

        const event = mockEvents()[0];
        const location = event.shelterLocations[0];

        expect(store.$services.events.addShelterLocation).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('event/addShelterLocation', { eventId: event.id, payload: location });

        expect(store.$services.events.addShelterLocation).toHaveBeenCalledTimes(1);
        expect(store.$services.events.addShelterLocation).toHaveBeenCalledWith(event.id, location);

        expect(res).toEqual(event);

        expect(store.state.event.events[0]).toEqual(event);
      });
    });

    describe('editShelterLocation', () => {
      it('calls the editShelterLocation service and returns the new Event entity', async () => {
        const store = mockStore();

        const event = mockEvents()[0];
        const shelterLocation = event.shelterLocations[0];
        const shelterLocationId = shelterLocation.id;

        expect(store.$services.events.editShelterLocation).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('event/editShelterLocation', {
          eventId: event.id,
          shelterLocationId,
          payload: shelterLocation,
        });

        expect(store.$services.events.editShelterLocation).toHaveBeenCalledTimes(1);
        expect(store.$services.events.editShelterLocation).toHaveBeenCalledWith(event.id, shelterLocationId, shelterLocation);

        expect(res).toEqual(event);

        expect(store.state.event.events[0]).toEqual(event);
      });
    });
  });
});
