import { Event, mockEventsSearchData } from '@/entities/event';
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
  });
});
