import { Store } from 'vuex';
import Vue from 'vue';
import applicationInsights from '@libs/core-lib/plugins/applicationInsights/applicationInsights';
import { mockStore, IRootState } from '@/store';
import { Toasted } from 'vue-toasted';
import {
  mockUsersData, User,
} from '@libs/entities-lib/user';
import AuthenticationProvider from '@/auth/AuthenticationProvider';
import {
  mockStoreUserLevel,
  mockStoreUserContributorIM,
  mockStoreUserContributorFinance,
  mockStoreUserContributor3,
  mockStoreUserReadOnly,
  mockStoreUserNoRole,
} from '@/test/helpers';
import helpers from '@/ui/helpers/helpers';
import userHelpers from './userHelpers';

jest.mock('@libs/core-lib/plugins/applicationInsights/applicationInsights');

describe('>>> Users Module', () => {
  let store: Store<IRootState>;

  Vue.toasted = {
    global: {
      warning: jest.fn(),
      error: jest.fn(),
    },
  } as Toasted;

  beforeEach(() => {
    store = mockStoreUserLevel(1);
    applicationInsights.trackTrace = jest.fn();
    jest.clearAllMocks();
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
        homeAccountId: mockUser.homeAccountId,
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
          homeAccountId: '',
        }));

        store.commit('user/setUser', mockUsersData()[0]);

        const mockUser = mockUsersData()[0];

        expect(store.getters['user/user']).toEqual(new User({
          oid: mockUser.oid,
          email: mockUser.email,
          family_name: mockUser.family_name,
          given_name: mockUser.given_name,
          roles: mockUser.roles,
          homeAccountId: mockUser.homeAccountId,
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
          homeAccountId: '',
        }));

        store.commit('user/setUser', mockUsersData()[1]);

        const mockUser = mockUsersData()[1];

        expect(store.getters['user/user']).toEqual(new User({
          oid: mockUser.oid,
          email: mockUser.preferred_username,
          family_name: mockUser.family_name,
          given_name: mockUser.given_name,
          roles: mockUser.roles,
          homeAccountId: mockUser.homeAccountId,
        }));
      });

      it('sets the user data in application insights', () => {
        store = mockStore();

        const mockUser = mockUsersData()[0];
        store.commit('user/setUser', mockUser);

        expect(applicationInsights.setUserId).toHaveBeenCalledWith(`${mockUser.email}_${mockUser.oid}`);
        expect(applicationInsights.setBasicContext).toHaveBeenCalledWith({ name: mockUser.email });
        expect(applicationInsights.setBasicContext).toHaveBeenCalledWith({ uid: mockUser.oid });
        expect(applicationInsights.setBasicContext).toHaveBeenCalledWith({ roles: mockUser.roles });
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
      expect(AuthenticationProvider.signOut).toHaveBeenCalledTimes(0);

      await store.dispatch('user/signOut');

      expect(AuthenticationProvider.signOut).toHaveBeenCalledTimes(1);
    });

    describe('fetchUserData', () => {
      it('calls userData with the current roles and it sets the user data into the store, if there are current roles', async () => {
        store = mockStore();
        const user = mockUsersData()[0];
        const originalFunction = store.dispatch;
        jest.spyOn(store, 'dispatch')
          .mockImplementationOnce((args) => Promise.resolve(originalFunction(args)))
          .mockImplementationOnce(() => Promise.resolve(['level5']))
          .mockImplementationOnce(() => Promise.resolve(false));
        userHelpers.getUserData = jest.fn(() => user);

        await store.dispatch('user/fetchUserData');

        expect(userHelpers.getUserData).toBeCalledWith(['level5']);

        expect(store.getters['user/user']).toEqual(new User({
          oid: user.oid,
          email: user.email,
          family_name: user.family_name,
          given_name: user.given_name,
          roles: user.roles,
          homeAccountId: user.homeAccountId,
        }));
      });

      it('opens an error toaster and calls sign out if the role has changed', async () => {
        store = mockStore();
        const originalFunction = store.dispatch;
        Vue.toasted.global.error = jest.fn();
        AuthenticationProvider.signOut = jest.fn();

        jest.spyOn(store, 'dispatch')
          .mockImplementationOnce((args) => Promise.resolve(originalFunction(args)))
          .mockImplementationOnce(() => Promise.resolve(['level5']))
          .mockImplementationOnce(() => Promise.resolve(true));

        await store.dispatch('user/fetchUserData');

        expect(Vue.toasted.global.error).toBeCalledWith('Your system access has been changed. You need to sign in again.');
        expect(AuthenticationProvider.signOut).toBeCalledTimes(1);
      });
    });

    describe('isRoleChanged', () => {
      it('returns true if the passed argument and the roles that are now in store have no element in common', async () => {
        store.state.user.roles = ['level1'];
        const result = await store.dispatch('user/isRoleChanged', ['level2']);
        expect(result).toEqual(true);
      });

      it('returns false if the passed argument and the roles that are now in store have elements in common', async () => {
        store.state.user.roles = ['level1'];
        const result = await store.dispatch('user/isRoleChanged', ['level1']);
        expect(result).toEqual(false);
      });
    });

    describe('getCurrentRoles', () => {
      it('calls acquire token', async () => {
        AuthenticationProvider.acquireToken = jest.fn();
        await store.dispatch('user/getCurrentRoles');

        expect(AuthenticationProvider.acquireToken).toBeCalledTimes(1);
      });

      it('calls decodeJwt and returns currentRoles', async () => {
        AuthenticationProvider.acquireToken = jest.fn(() => Promise.resolve('mock-token'));
        const currentRoles = { roles: ['level1'] };

        helpers.decodeJwt = jest.fn(() => currentRoles);
        const result = await store.dispatch('user/getCurrentRoles');

        expect(result).toEqual(currentRoles.roles);
      });
    });
  });
});
