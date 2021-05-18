import { mockStore } from '@/store';
import { mockUserAccountSearchData } from '@/entities/user-account';
import { makeStorage } from './storage';

const store = mockStore({
  modules: {
    user: {
      state: {
        userAccounts: mockUserAccountSearchData(),
      },
    },
  },
}, { commit: true, dispatch: true });

const storage = makeStorage(store);

describe('>>> User Account Storage', () => {
  describe('>> Getters', () => {
    it('should proxy userAccountById', () => {
      expect(storage.getters.userAccountById('TEST_ID')).toEqual(store.getters['userAccount/userAccountById']('TEST_ID'));
    });
  });

  describe('>> Actions', () => {
    describe('fetchUserAccount', () => {
      it('should proxy fetchUserAccount', () => {
        storage.actions.fetchUserAccount('TEST_ID');
        expect(store.dispatch).toBeCalledWith('userAccount/fetchUserAccount', 'TEST_ID');
      });
    });
    describe('addRoleToUser', () => {
      it('should proxy addRoleToUser', () => {
        const payload = { roleId: 'uuid', userId: 'uuid' };
        storage.actions.addRoleToUser(payload);
        expect(store.dispatch).toBeCalledWith('userAccount/addRoleToUser', payload);
      });
    });

    describe('searchUserAccounts', () => {
      it('should proxy searchUserAccounts', () => {
        storage.actions.searchUserAccounts({});
        expect(store.dispatch).toHaveBeenCalledWith('userAccount/searchUserAccounts', {});
      });
    });
  });
});
