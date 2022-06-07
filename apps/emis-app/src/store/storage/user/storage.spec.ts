import { mockStore } from '@/store';
import { mockUsersData } from '@/entities/user';
import { makeStorage } from './storage';

const store = mockStore({
  modules: {
    user: {
      state: {
        ...mockUsersData()[0],
      },
    },
  },
}, { commit: true, dispatch: true });

const storage = makeStorage(store);

describe('>>> User Storage', () => {
  describe('>> Getters', () => {
    it('should proxy user', () => {
      expect(storage.getters.user()).toEqual(store.getters['user/user']);
    });

    it('should proxy userId', () => {
      expect(storage.getters.userId()).toEqual(store.getters['user/userId']);
    });

    it('should proxy landingPage', () => {
      expect(storage.getters.landingPage()).toEqual(store.getters['user/landingPage']);
    });
  });

  describe('>> Actions', () => {
    it('should proxy signOut', () => {
      storage.actions.signOut();
      expect(store.dispatch).toBeCalledWith('user/signOut');
    });

    it('should proxy fetchUserData', () => {
      storage.actions.fetchUserData();
      expect(store.dispatch).toBeCalledWith('user/fetchUserData');
    });

    it('should proxy getCurrentRoles', () => {
      storage.actions.getCurrentRoles();
      expect(store.dispatch).toBeCalledWith('user/getCurrentRoles');
    });

    it('should proxy isRoleChanged', () => {
      const currentRoles = ['level1'];
      storage.actions.isRoleChanged(currentRoles);
      expect(store.dispatch).toBeCalledWith('user/isRoleChanged', currentRoles);
    });
  });

  describe('>> Mutations', () => {
    it('should proxy setUser', () => {
      const payload = mockUsersData()[0];
      storage.mutations.setUser(payload);
      expect(store.commit).toBeCalledWith('user/setUser', payload);
    });
  });
});
