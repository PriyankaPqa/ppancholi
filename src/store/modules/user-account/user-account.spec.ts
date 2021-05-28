import { Store } from 'vuex';
import { mockStore, IRootState } from '@/store';
import { mockSearchParams } from '@/test/helpers';
import {
  IUserAccountData,
  mockSearchUserAccounts,
  mockUserAccountSearchData,
  UserAccount,
} from '@/entities/user-account';
import { mockUserAccount } from '@/entities/user';

describe('>>> User Account Module', () => {
  let store: Store<IRootState>;

  beforeEach(() => {
    store = mockStore({
      modules: {
        userAccount: {
          state: {
            userAccounts: mockUserAccountSearchData(),
          },
        },
      },
    });
  });

  describe('>> Getters', () => {
    describe('userAccountById', () => {
      test('the getter returns the user account with the id passed in the argument', () => {
        const mockId = mockUserAccountSearchData()[0].userAccountId;
        expect(store.getters['userAccount/userAccountById'](mockId)).toEqual(new UserAccount(mockUserAccountSearchData()[0]));
      });

      test('the getter return null if the id passed in argument does not correspond to an userAccount', () => {
        const mockId = 'foo';
        expect(store.getters['userAccount/userAccountById'](mockId)).toEqual(null);
      });
    });
  });

  describe('>> Mutations', () => {
    describe('addOrUpdateUserAccount', () => {
      it('adds a new userAccount to the state', () => {
        store = mockStore();

        const userAccount = mockUserAccountSearchData()[0];

        expect(store.state.userAccount.userAccounts).toEqual([]);

        store.commit('userAccount/addOrUpdateUserAccount', userAccount);

        expect(store.state.userAccount.userAccounts).toEqual([userAccount]);
      });

      it('updates an existing userAccount', () => {
        const userAccounts = mockUserAccountSearchData();

        expect(store.state.userAccount.userAccounts).toEqual(userAccounts);

        const updatedAccount = mockUserAccountSearchData()[0];

        updatedAccount.caseFilesCount = 10;

        store.commit('userAccount/addOrUpdateUserAccount', updatedAccount);

        expect(store.state.userAccount.userAccounts[0]).toEqual(
          {
            ...userAccounts[0],
            caseFilesCount: 10,
          },
        );
      });
    });

    describe('setSearchLoading', () => {
      test('the setSearchLoading mutation sets the searchLoading state', () => {
        store = mockStore();

        store.commit('userAccount/setSearchLoading', true);

        expect(store.state.userAccount.searchLoading).toBeTruthy();
      });
    });

    describe('setUserAccounts', () => {
      it('sets the userAccounts state correctly', () => {
        store = mockStore();
        const userAccounts = [mockUserAccount()];
        store.commit('userAccount/setUserAccounts', userAccounts);

        expect(store.state.userAccount.userAccounts).toEqual(userAccounts);
      });
    });

    describe('deleteUserAccount', () => {
      it('sets the userAccounts state correctly', () => {
        store = mockStore();
        const userAccounts = mockUserAccountSearchData();
        store.commit('userAccount/setUserAccounts', userAccounts);
        expect(store.state.userAccount.userAccounts).toEqual(userAccounts);
        store.$services.userAccounts.deleteUserAccount = jest.fn();

        store.commit('userAccount/deleteUserAccount', userAccounts[1].userAccountId);
        const deletedAccount = store.state.userAccount.userAccounts.filter((u) => u.userAccountId === userAccounts[1].userAccountId)[0];
        expect(deletedAccount).toBeTruthy();
        expect(deletedAccount.accountStatus).toEqual(1);
        expect(deletedAccount.userAccountStatus).toEqual(1);
      });
    });
  });

  describe('>> Actions', () => {
    describe('fetchEvent', () => {
      it('calls the searchUserAccounts service and returns the userAccount', async () => {
        const store = mockStore();
        const userAccount = mockUserAccountSearchData()[0];

        jest.spyOn(store.$services.userAccounts, 'searchUserAccounts').mockReturnValueOnce(mockSearchUserAccounts(0));

        expect(store.$services.userAccounts.searchUserAccounts).toHaveBeenCalledTimes(0);

        const res = await store.dispatch('userAccount/fetchUserAccount', userAccount.userAccountId);

        expect(store.$services.userAccounts.searchUserAccounts).toHaveBeenCalledWith({ filter: { UserAccountId: userAccount.userAccountId } });

        expect(store.state.userAccount.userAccounts).toEqual([
          userAccount,
        ]);

        expect(res).toEqual(new UserAccount(userAccount));
      });

      test('if the userAccount already exists in the store, do not call the API', async () => {
        const store = mockStore();
        const userAccount = mockUserAccountSearchData()[0];
        jest.spyOn(store.$services.userAccounts, 'searchUserAccounts').mockReturnValueOnce(mockSearchUserAccounts(0));

        expect(store.$services.userAccounts.searchUserAccounts).toHaveBeenCalledTimes(0);

        await store.dispatch('userAccount/fetchUserAccount', userAccount.userAccountId);

        expect(store.$services.userAccounts.searchUserAccounts).toHaveBeenCalledTimes(1);

        await store.dispatch('userAccount/fetchUserAccount', userAccount.userAccountId);

        expect(store.$services.userAccounts.searchUserAccounts).toHaveBeenCalledTimes(1);
      });
    });

    describe('searchUserAccounts', () => {
      it('calls the service with the passed params', async () => {
        expect(store.$services.userAccounts.searchUserAccounts).toHaveBeenCalledTimes(0);

        const params = mockSearchParams;
        await store.dispatch('userAccount/searchUserAccounts', params);

        expect(store.$services.userAccounts.searchUserAccounts).toHaveBeenCalledWith(params);
      });
    });

    describe('addRoleToUser', () => {
      it('calls the service with the passed payload', async () => {
        const role = {
          id: '123',
          name: {
            translation: {
              en: 'case worker 2',
              fr: 'case worker 2 fr',
            },
          },
        };
        const user = mockUserAccount();
        user.id = 'mock-id';
        jest.spyOn(store.$services.userAccounts, 'addRoleToUser').mockReturnValue(user);
        const payload = { subRole: role, userId: 'mock-id' };
        const resultPayload:IUserAccountData = await store.dispatch('userAccount/addRoleToUser', payload);

        expect(store.$services.userAccounts.addRoleToUser).toHaveBeenCalledWith(payload);
        expect(resultPayload).toEqual(user);
      });
    });

    describe('fetchAllUserAccounts', () => {
      it('calls the service', async () => {
        expect(store.$services.userAccounts.fetchAllUserAccounts).toHaveBeenCalledTimes(0);
        jest.spyOn(store.$services.userAccounts, 'fetchAllUserAccounts').mockReturnValue(mockSearchUserAccounts());

        await store.dispatch('userAccount/fetchAllUserAccounts');

        expect(store.$services.userAccounts.fetchAllUserAccounts).toHaveBeenCalled();
      });
    });

    describe('deleteUserAccount', () => {
      it('calls the correct service', async () => {
        store = mockStore();
        const userAccounts = mockUserAccountSearchData();
        store.commit('userAccount/setUserAccounts', userAccounts);

        jest.spyOn(store.$services.userAccounts, 'deleteUserAccount');

        expect(store.$services.userAccounts.deleteUserAccount).toHaveBeenCalledTimes(0);

        await store.dispatch('userAccount/deleteUserAccount', userAccounts[0].userAccountId);

        expect(store.$services.userAccounts.deleteUserAccount).toHaveBeenCalledTimes(1);
      });
    });
  });
});
