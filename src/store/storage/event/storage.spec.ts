import { Event, IEventCallCentre, mockEventsSearchData } from '@/entities/event';
import { mockStore } from '@/store';
import { mockSearchParams } from '@/test/helpers';
import { makeStorage } from './storage';

const store = mockStore({}, { commit: true, dispatch: true });
const storage = makeStorage(store);

describe('>>> Event Storage', () => {
  describe('>> Getters', () => {
    it('should proxy eventTypes', () => {
      expect(storage.getters.eventTypes()).toEqual(store.getters['event/eventTypes']);
    });

    it('should proxy events', () => {
      expect(storage.getters.events()).toEqual(store.getters['event/events']);
    });

    it('should proxy openEvents', () => {
      expect(storage.getters.openEvents()).toEqual(store.getters['event/openEvents']);
    });

    it('should proxy eventById', () => {
      expect(storage.getters.eventById('TEST_ID')).toEqual(store.getters['event/eventById']('TEST_ID'));
    });
  });

  describe('>> Actions', () => {
    it('should proxy fetchEventTypes', () => {
      storage.actions.fetchEventTypes();
      expect(store.dispatch).toBeCalledWith('event/fetchEventTypes');
    });

    it('should proxy fetchEvent', () => {
      storage.actions.fetchEvent('TEST_ID');
      expect(store.dispatch).toBeCalledWith('event/fetchEvent', 'TEST_ID');
    });

    it('should proxy fetchEvents', () => {
      storage.actions.fetchEvents();
      expect(store.dispatch).toBeCalledWith('event/fetchEvents');
    });

    it('should proxy fetchOtherProvinces', () => {
      storage.actions.fetchOtherProvinces();
      expect(store.dispatch).toBeCalledWith('event/fetchOtherProvinces');
    });

    it('should proxy fetchRegions', () => {
      storage.actions.fetchRegions();
      expect(store.dispatch).toBeCalledWith('event/fetchRegions');
    });

    it('should proxy searchEvents', () => {
      const params = mockSearchParams;
      storage.actions.searchEvents(params);
      expect(store.dispatch).toBeCalledWith('event/searchEvents', params);
    });

    it('should proxy createEvent', () => {
      const event = new Event(mockEventsSearchData()[0]);
      storage.actions.createEvent(event);
      expect(store.dispatch).toHaveBeenCalledWith('event/createEvent', event);
    });

    it('should proxy updateEvent', () => {
      const event = new Event(mockEventsSearchData()[0]);
      storage.actions.updateEvent(event);
      expect(store.dispatch).toHaveBeenCalledWith('event/updateEvent', event);
    });

    it('should proxy addCallCentre', () => {
      const event = new Event(mockEventsSearchData()[0]);
      const callCentre = event.callCentres[0];
      storage.actions.addCallCentre({ eventId: event.id, payload: callCentre });
      expect(store.dispatch).toHaveBeenCalledWith('event/addCallCentre', { eventId: event.id, payload: callCentre });
    });

    it('should proxy editCallCentre', () => {
      const event = new Event(mockEventsSearchData()[0]);
      const callCentre1 = event.callCentres[0];
      const callCentre2 = { ...callCentre1, startDate: null } as IEventCallCentre;
      const payload = { originalCallCentre: callCentre1, updatedCallCentre: callCentre2 };
      storage.actions.editCallCentre({ eventId: event.id, payload });
      expect(store.dispatch).toHaveBeenCalledWith('event/editCallCentre', { eventId: event.id, payload });
    });

    it('should proxy toggleSelfRegistration', () => {
      const event = new Event(mockEventsSearchData()[0]);
      storage.actions.toggleSelfRegistration({ id: event.id, selfRegistrationEnabled: false });
      expect(store.dispatch).toHaveBeenCalledWith('event/toggleSelfRegistration', {
        id: event.id,
        selfRegistrationEnabled: false,
      });
    });
  });
});
