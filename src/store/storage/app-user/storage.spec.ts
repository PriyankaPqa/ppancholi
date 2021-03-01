import { mockStore } from '@/store';
import { makeStorage } from './storage';

const store = mockStore({}, { commit: true, dispatch: true });

const storage = makeStorage(store);

describe('>>> App User Storage', () => {
  describe('>> Getters', () => {
    it('should proxy appUsersWithInfo', () => {
      expect(storage.getters.appUsersWithInfo()).toEqual(store.getters['appUser/appUsersWithInfo']);
    });

    it('should proxy appUserWhere', () => {
      expect(storage.getters.appUserWhere('key', 'value'));
    });
  });

  describe('>> Actions', () => {
    it('should proxy fetchAllUsers', () => {
      storage.actions.fetchAllUsers();
      expect(store.dispatch).toBeCalledWith('appUser/fetchAllUsers');
    });

    it('should proxy fetchAppUsers', () => {
      storage.actions.fetchAppUsers();
      expect(store.dispatch).toBeCalledWith('appUser/fetchAppUsers');
    });

    it('should proxy fetchRoles', () => {
      storage.actions.fetchRoles();
      expect(store.dispatch).toBeCalledWith('appUser/fetchRoles');
    });
  });
});
