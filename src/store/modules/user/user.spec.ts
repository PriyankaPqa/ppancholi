import { Store } from 'vuex';
import { mockStore, IRootState } from '@/store';
import {
  mockUsersData, User,
} from '@/entities/user';
import { mockAuthenticationData } from '@/auth/authentication.mock';
import authenticationProvider from '@/auth/AuthenticationProvider';
import {
  mockStoreUserLevel,
  mockStoreUserContributorIM,
  mockStoreUserContributorFinance,
  mockStoreUserContributor3,
  mockStoreUserReadOnly,
  mockStoreUserNoRole,
} from '@/test/helpers';

describe('>>> Users Module', () => {
  let store: Store<IRootState>;

  beforeEach(() => {
    store = mockStoreUserLevel(1);
  });

  describe('>> Getters', () => {
    test('the user getter returns the current user entity', () => {
      const mockUser = mockUsersData()[0];

      expect(store.getters['user/user']).toEqual(new User({
        oid: mockUser.oid,
        email: mockUser.email,
        family_name: mockUser.family_name,
        given_name: mockUser.given_name,
        roles: mockUser.roles,
      }));
    });

    test('the userId getter returns the current user id', () => {
      const mockUser = mockUsersData()[0];

      expect(store.getters['user/userId']).toEqual(mockUser.oid);
    });

    describe('landingPage', () => {
      it('returns proper landing page for level 1 user', () => {
        store = mockStoreUserLevel(1);
        expect(store.getters['user/landingPage']).toEqual('DashboardCaseFile');
      });

      it('returns proper landing page for level 2 user', () => {
        store = mockStoreUserLevel(2);
        expect(store.getters['user/landingPage']).toEqual('DashboardCaseFile');
      });

      it('returns proper landing page for level 3 user', () => {
        store = mockStoreUserLevel(3);
        expect(store.getters['user/landingPage']).toEqual('HomeLevel3');
      });

      it('returns proper landing page for level 4 user', () => {
        store = mockStoreUserLevel(4);
        expect(store.getters['user/landingPage']).toEqual('HomeLevel4');
      });

      it('returns proper landing page for level 5 user', () => {
        store = mockStoreUserLevel(5);
        expect(store.getters['user/landingPage']).toEqual('HomeLevel5');
      });

      it('returns proper landing page for level 6 user', () => {
        store = mockStoreUserLevel(6);
        expect(store.getters['user/landingPage']).toEqual('HomeLevel6');
      });

      it('returns proper landing page for contributorIM user', () => {
        store = mockStoreUserContributorIM();
        expect(store.getters['user/landingPage']).toEqual('DashboardCaseFile');
      });

      it('returns proper landing page for contributorFinance user', () => {
        store = mockStoreUserContributorFinance();
        expect(store.getters['user/landingPage']).toEqual('DashboardCaseFile');
      });

      it('returns proper landing page for contributor3 user', () => {
        store = mockStoreUserContributor3();
        expect(store.getters['user/landingPage']).toEqual('DashboardCaseFile');
      });

      it('returns proper landing page for ready only user', () => {
        store = mockStoreUserReadOnly();
        expect(store.getters['user/landingPage']).toEqual('DashboardCaseFile');
      });

      it('returns proper landing page user with no role', () => {
        store = mockStoreUserNoRole();
        expect(store.getters['user/landingPage']).toEqual('HomeNoRole');
      });
    });
  });

  describe('>> Mutations', () => {
    describe('setUser', () => {
      it('should set the user data in the store', () => {
        store = mockStore();

        expect(store.getters['user/user']).toEqual(new User({
          oid: '',
          email: '',
          family_name: '',
          given_name: '',
          roles: [],
        }));

        store.commit('user/setUser', mockUsersData()[0]);

        const mockUser = mockUsersData()[0];

        expect(store.getters['user/user']).toEqual(new User({
          oid: mockUser.oid,
          email: mockUser.email,
          family_name: mockUser.family_name,
          given_name: mockUser.given_name,
          roles: mockUser.roles,
        }));
      });

      it('uses preferred_name for email if email is not available', () => {
        store = mockStore();

        expect(store.getters['user/user']).toEqual(new User({
          oid: '',
          email: '',
          family_name: '',
          given_name: '',
          roles: [],
        }));

        store.commit('user/setUser', mockUsersData()[1]);

        const mockUser = mockUsersData()[1];

        expect(store.getters['user/user']).toEqual(new User({
          oid: mockUser.oid,
          email: mockUser.preferred_username,
          family_name: mockUser.family_name,
          given_name: mockUser.given_name,
          roles: mockUser.roles,
        }));
      });
    });

    describe('setRole', () => {
      it('should set roles in the state', () => {
        store = mockStore();

        expect(store.state.user.roles).toEqual([]);

        store.commit('user/setRole', 'role');

        expect(store.state.user.roles).toEqual(['role']);
      });
    });
  });

  describe('>> Actions', () => {
    test('the signOut action calls the signOut method of the authentication provider', async () => {
      expect(authenticationProvider.signOut).toHaveBeenCalledTimes(0);

      await store.dispatch('user/signOut');

      expect(authenticationProvider.signOut).toHaveBeenCalledTimes(1);
    });

    describe('fetchUserData', () => {
      it('calls the acquireToken method of the authentications provider and fetchUser and sets the user data', async () => {
        store = mockStore();

        await store.dispatch('user/fetchUserData');

        expect(authenticationProvider.acquireToken).toHaveBeenCalledTimes(1);

        const authenticationData = mockAuthenticationData();

        expect(store.getters['user/user']).toEqual(new User({
          oid: authenticationData.account.idTokenClaims.oid as string,
          email: authenticationData.account.idTokenClaims.email as string,
          family_name: authenticationData.account.idTokenClaims.family_name as string,
          given_name: authenticationData.account.idTokenClaims.given_name as string,
          roles: authenticationData.account.idTokenClaims.roles as string[],
        }));
      });
    });
  });
});
