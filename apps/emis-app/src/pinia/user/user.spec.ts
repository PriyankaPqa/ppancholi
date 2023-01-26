import Vue from 'vue';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { Toasted } from 'vue-toasted';
import {
  mockUserL1,
  mockUsersData, User,
} from '@libs/entities-lib/user';
import { getPiniaForUser, Role } from '@/pinia/user/user.mock';
import { useUserStore } from './user';
import helpers from '../../ui/helpers/helpers';
import AuthenticationProvider from '../../auth/AuthenticationProvider';

jest.mock('@libs/shared-lib/plugins/applicationInsights/applicationInsights');

// eslint-disable-next-line no-console
console.info = jest.fn();

const createUserTestStore = (mockTarget: Role, stubActions = false) => {
  const pinia = getPiniaForUser(mockTarget, stubActions);
  const store = useUserStore(pinia);

  return store;
};

describe('>>> User Store', () => {
  Vue.toasted = {
    global: {
      warning: jest.fn(),
      error: jest.fn(),
    },
  } as Toasted;

  beforeEach(() => {
    applicationInsights.trackTrace = jest.fn();
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    it('should return the current user entity', () => {
      const mockUser = mockUserL1();
      const store = createUserTestStore('level1');
      expect(store.getUser()).toEqual(new User({
        oid: mockUser.id,
        email: mockUser.email,
        family_name: mockUser.lastName,
        given_name: mockUser.firstName,
        roles: mockUser.roles,
        homeAccountId: mockUser.homeAccountId,
      }));
    });
  });

  describe('getUserId', () => {
    it('should return the oid', () => {
      const mockUser = mockUserL1();
      const store = createUserTestStore('level1');
      expect(store.getUserId()).toEqual(mockUser.id);
    });
  });

  describe('getLandingPage', () => {
    it('returns proper landing page for level 0 user', () => {
      const store = createUserTestStore('level0');
      expect(store.getLandingPage()).toEqual('DashboardCaseFile');
    });

    it('returns proper landing page for level 1 user', () => {
      const store = createUserTestStore('level1');
      expect(store.getLandingPage()).toEqual('DashboardCaseFile');
    });

    it('returns proper landing page for level 2 user', () => {
      const store = createUserTestStore('level2');
      expect(store.getLandingPage()).toEqual('DashboardCaseFile');
    });

    it('returns proper landing page for level 3 user', () => {
      const store = createUserTestStore('level3');
      expect(store.getLandingPage()).toEqual('HomeLevel3');
    });

    it('returns proper landing page for level 4 user', () => {
      const store = createUserTestStore('level4');
      expect(store.getLandingPage()).toEqual('HomeLevel4');
    });

    it('returns proper landing page for level 5 user', () => {
      const store = createUserTestStore('level5');
      expect(store.getLandingPage()).toEqual('HomeLevel5');
    });

    it('returns proper landing page for level 6 user', () => {
      const store = createUserTestStore('level6');
      expect(store.getLandingPage()).toEqual('HomeLevel6');
    });

    it('returns proper landing page for contributorIM user', () => {
      const store = createUserTestStore('contributorIM');
      expect(store.getLandingPage()).toEqual('HomeContributorIM');
    });

    it('returns proper landing page for contributorFinance user', () => {
      const store = createUserTestStore('contributorFinance');
      expect(store.getLandingPage()).toEqual('DashboardCaseFile');
    });

    it('returns proper landing page for contributor3 user', () => {
      const store = createUserTestStore('contributor3');
      expect(store.getLandingPage()).toEqual('DashboardCaseFile');
    });

    it('returns proper landing page for ready only user', () => {
      const store = createUserTestStore('readOnly');
      expect(store.getLandingPage()).toEqual('DashboardCaseFile');
    });

    it('returns proper landing page user with no role', () => {
      const store = createUserTestStore('noRole');
      expect(store.getLandingPage()).toEqual('HomeNoRole');
    });
  });

  describe('setUser', () => {
    it('should set the user data in the store', () => {
      const store = createUserTestStore('level1');
      const mockUser = mockUsersData()[5];
      store.setUser(mockUser);

      expect(store.getUser()).toEqual(new User({
        oid: mockUser.oid,
        email: mockUser.email,
        family_name: mockUser.family_name,
        given_name: mockUser.given_name,
        roles: mockUser.roles,
        homeAccountId: mockUser.homeAccountId,
      }));
    });

    it('uses preferred_name for email if email is not available', () => {
      const store = createUserTestStore('level1');
      const mockUser = mockUsersData()[1];
      store.setUser(mockUser);

      expect(store.getUser()).toEqual(new User({
        oid: mockUser.oid,
        email: mockUser.preferred_username,
        family_name: mockUser.family_name,
        given_name: mockUser.given_name,
        roles: mockUser.roles,
        homeAccountId: mockUser.homeAccountId,
      }));
    });

    // TODO: Creates issues when running other tests. I don't know why, so leave it commented for now

    // it('sets the user data in application insights', () => {
    //   const store = createUserTestStore('level3');
    //   const mockUser = mockUsersData()[0];
    //   store.setUser(mockUser);
    //
    //   expect(applicationInsights.setUserId).toHaveBeenCalledWith(`${mockUser.email}_${mockUser.oid}`);
    //   expect(applicationInsights.setBasicContext).toHaveBeenCalledWith({ name: mockUser.email });
    //   expect(applicationInsights.setBasicContext).toHaveBeenCalledWith({ uid: mockUser.oid });
    //   expect(applicationInsights.setBasicContext).toHaveBeenCalledWith({ roles: mockUser.roles });
    // });
  });

  describe('setRole', () => {
    it('should set roles in the state', () => {
      const store = createUserTestStore('level1');

      store.setRole('newRole');

      expect(store.roles).toEqual(['newRole']);
    });
  });

  describe('signOut', () => {
    it('should call the signout method of the authenticaiton provider', async () => {
      const store = createUserTestStore('level1');
      expect(AuthenticationProvider.signOut).toHaveBeenCalledTimes(0);

      await store.signOut();

      expect(AuthenticationProvider.signOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('isRoleChanged', () => {
    it('returns true if the passed argument and the roles that are now in store have no element in common', () => {
      const store = createUserTestStore('level1');
      const result = store.isRoleChanged(['level2']);
      expect(result).toEqual(true);
    });

    it('returns false if the passed argument and the roles that are now in store have elements in common', () => {
      const store = createUserTestStore('level1');
      const result = store.isRoleChanged(['level1']);
      expect(result).toEqual(false);
    });
  });

  describe('getCurrentRoles', () => {
    it('calls acquire token', async () => {
      const store = createUserTestStore('level1');
      AuthenticationProvider.acquireToken = jest.fn();
      await store.getCurrentRoles();
      expect(AuthenticationProvider.acquireToken).toBeCalledTimes(1);
    });

    it('calls decodeJwt and returns currentRoles', async () => {
      const store = createUserTestStore('level1');
      AuthenticationProvider.acquireToken = jest.fn(() => Promise.resolve('mock-token'));
      const currentRoles = { roles: ['level1'] };

      helpers.decodeJwt = jest.fn(() => currentRoles);
      const result = await store.getCurrentRoles();

      expect(result).toEqual(currentRoles.roles);
    });
  });

  // Seems that we cannot mock an internal actions getCurrentRoles
  // describe('fetchUserData', () => {
  //     it('calls getUserData with the current roles and it sets the user data into the store, if there are current roles', async () => {
  //       const store = createUserTestStore('level1', true);
  //       store.getCurrentRoles = jest.fn(() => Promise.resolve(['level5']));
  //       store.isRoleChanged = jest.fn(() => true);
  //       const user = mockUsersData()[0];
  //
  //       userHelpers.getUserData = jest.fn(() => user);
  //
  //       await store.fetchUserData();
  //
  //       expect(userHelpers.getUserData).toBeCalledWith(['level5']);
  //
  //       expect(store.getUser()).toEqual(new User({
  //         oid: user.oid,
  //         email: user.email,
  //         family_name: user.family_name,
  //         given_name: user.given_name,
  //         roles: user.roles,
  //         homeAccountId: user.homeAccountId,
  //       }));
  //     });
  //
  //     // it('opens an error toaster and calls sign out if the role has changed', async () => {
  //     //   store = mockStore();
  //     //   const originalFunction = store.dispatch;
  //     //   Vue.toasted.global.error = jest.fn();
  //     //   AuthenticationProvider.signOut = jest.fn();
  //     //
  //     //   jest.spyOn(store, 'dispatch')
  //     //     .mockImplementationOnce((args) => Promise.resolve(originalFunction(args)))
  //     //     .mockImplementationOnce(() => Promise.resolve(['level5']))
  //     //     .mockImplementationOnce(() => Promise.resolve(true));
  //     //
  //     //   await store.dispatch('user/fetchUserData');
  //     //
  //     //   expect(Vue.toasted.global.error).toBeCalledWith('Your system access has been changed. You need to sign in again.');
  //     //   expect(AuthenticationProvider.signOut).toBeCalledTimes(1);
  //     // });
  //   });
});
