import { mockStore } from '@/store';
import { makeStorage } from './storage';

const store = mockStore({}, { commit: true, dispatch: true });
const storage = makeStorage(store);

describe('>>> Registration Storage', () => {
  describe('>> Getters', () => {
    it('should proxy event', () => {
      expect(storage.getters.event()).toEqual(store.getters['registration/event']);
    });
  });

  describe('>> Actions', () => {
    it('should proxy fetchEvent', () => {
      const filter = 'test';
      storage.actions.fetchEvent(filter);
      expect(store.dispatch).toBeCalledWith('registration/fetchEvent', filter);
    });
  });
});
