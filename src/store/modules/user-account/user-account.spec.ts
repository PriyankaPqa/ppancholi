import { Store } from 'vuex';
import { mockStore, IRootState } from '@/store';
import { mockSearchParams } from '@/test/helpers';
import { mockSearchUserAccounts, mockUserAccountSearchData, UserAccount } from '@/entities/user-account';

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

        updatedAccount.caseFilesCount = 22;

        store.commit('userAccount/addOrUpdateUserAccount', updatedAccount);

        expect(store.state.userAccount.userAccounts).toEqual([
          {
            ...userAccounts[0],
            caseFilesCount: 22,
          },
        ]);
      });
    });

    describe('setSearchLoading', () => {
      test('the setSearchLoading mutation sets the searchLoading state', () => {
        store = mockStore();

        store.commit('userAccount/setSearchLoading', true);

        expect(store.state.userAccount.searchLoading).toBeTruthy();
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
  });
});
