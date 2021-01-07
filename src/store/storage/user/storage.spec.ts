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

describe('>>> Storage', () => {
  describe('>> Getters', () => {
    it('should proxy user', () => {
      expect(storage.getters.user()).toEqual(store.getters['user/user']);
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
  });

  describe('>> Mutations', () => {
    it('should proxy setUser', () => {
      const payload = mockUsersData()[0];
      storage.mutations.setUser(payload);
      expect(store.commit).toBeCalledWith('user/setUser', payload);
    });
  });
});
