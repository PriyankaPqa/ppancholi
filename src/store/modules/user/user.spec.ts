import { Store } from 'vuex';
import { mockStore, IRootState } from '@/store';
import { mockUsersData, User } from '@/entities/user';
import { mockAuthenticationData } from '@/auth/authentication.mock';
import authenticationProvider from '@/auth/AuthenticationProvider';

describe('>>> Users Module', () => {
  let store: Store<IRootState>;

  beforeEach(() => {
    store = mockStore({
      modules: {
        user: {
          state: {
            ...mockUsersData()[0],
          },
        },
      },
    });
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
  });

  describe('>> Mutations', () => {
    test('the setUser mutation should set the user data in the store', () => {
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
  });

  describe('>> Actions', () => {
    test('the signOut action calls the signOut method of the authentication provider', async () => {
      expect(authenticationProvider.signOut).toHaveBeenCalledTimes(0);

      await store.dispatch('user/signOut');

      expect(authenticationProvider.signOut).toHaveBeenCalledTimes(1);
    });

    test('the fetchUserData calls the acquireToken method of the authentications provider and sets the user data', async () => {
      store = mockStore();

      expect(authenticationProvider.acquireToken).toHaveBeenCalledTimes(0);

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
