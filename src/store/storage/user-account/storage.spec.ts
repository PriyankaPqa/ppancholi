import { mockStore } from '@/store';
import { mockUserAccountSearchData } from '@/entities/user-account';
import { EOptionListItemStatus } from '@/entities/optionItem';
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
const mockSubRole = {
  id: '123',
  name: {
    translation: {
      en: 'case worker 2',
      fr: 'case worker 2 fr',
    },
  },
  orderRank: 1,
  status: EOptionListItemStatus.Active,
  isOther: false,
  isDefault: false,
};

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

    describe('fetchAllUserAccounts', () => {
      it('should proxy fetchUserAccount', () => {
        storage.actions.fetchAllUserAccounts();
        expect(store.dispatch).toBeCalledWith('userAccount/fetchAllUserAccounts');
      });
    });

    describe('addRoleToUser', () => {
      it('should proxy addRoleToUser', () => {
        const payload = { subRole: mockSubRole, userId: 'uuid' };
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
