import { Event, mockEventsData } from '@/entities/event';
import { mockStore } from '@/store';
import { makeStorage } from './storage';

const store = mockStore({}, { commit: true, dispatch: true });
const storage = makeStorage(store);

describe('>>> Event Storage', () => {
  describe('>> Getters', () => {
    it('should proxy eventTypes', () => {
      expect(storage.getters.eventTypes()).toEqual(store.getters['event/eventTypes']);
    });
  });

  describe('>> Actions', () => {
    it('should proxy fetchEventTypes', () => {
      storage.actions.fetchEventTypes();
      expect(store.dispatch).toBeCalledWith('event/fetchEventTypes');
    });

    it('should proxy createEvent', () => {
      const event = new Event(mockEventsData()[0]);
      storage.actions.createEvent(event);
      expect(store.dispatch).toHaveBeenCalledWith('event/createEvent', event);
    });
  });
});
