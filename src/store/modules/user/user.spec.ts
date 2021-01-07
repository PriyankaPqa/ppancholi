import { Store } from 'vuex';
import { mockStore, IRootState } from '@/store';
import { mockUsersData, User } from '@/entities/user';
import { authenticationResponseData } from '@/entities/authentication';

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
    test('the signOut action calls the signOut method of the authentications service', async () => {
      expect(store.$services.authentications.signOut).toHaveBeenCalledTimes(0);

      await store.dispatch('user/signOut');

      expect(store.$services.authentications.signOut).toHaveBeenCalledTimes(1);
    });

    test('the fetchUserData calls the getAccessToken method of the authentications service and sets the user data', async () => {
      store = mockStore();

      expect(store.$services.authentications.getAccessToken).toHaveBeenCalledTimes(0);

      await store.dispatch('user/fetchUserData');

      expect(store.$services.authentications.getAccessToken).toHaveBeenCalledTimes(1);

      expect(store.getters['user/user']).toEqual(new User({
        oid: authenticationResponseData.account.idTokenClaims.oid as string,
        email: authenticationResponseData.account.idTokenClaims.email as string,
        family_name: authenticationResponseData.account.idTokenClaims.family_name as string,
        given_name: authenticationResponseData.account.idTokenClaims.given_name as string,
        roles: authenticationResponseData.account.idTokenClaims.roles as string[],
      }));
    });
  });
});
