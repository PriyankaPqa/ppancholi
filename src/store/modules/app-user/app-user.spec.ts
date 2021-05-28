import { Store } from 'vuex';
import { mockStore, IRootState } from '@/store';
import {
  mockAllUsersData, mockAppUserAzureData, mockAppUserData, mockRolesData,
} from '@/entities/app-user';

describe('>>> App User Module', () => {
  let store: Store<IRootState>;

  beforeEach(() => {
    store = mockStore({
      modules: {
        appUser: {
          state: {
            allUsers: mockAllUsersData(),
            appUsers: mockAppUserAzureData(),
            roles: mockRolesData(),
            allUsersFetched: false,
            appUsersFetched: false,
            rolesFetched: false,
          },
        },
      },
    });
  });

  describe('>> Getters', () => {
    describe('appUsersWithInfo', () => {
      it('aggregates correctly different user information', () => {
        expect(store.getters['appUser/appUsersWithInfo']).toEqual([mockAppUserData()[0]]);
      });
    });

    describe('appUserWhere', () => {
      it('finds the app users where key equals value', () => {
        expect(store.getters['appUser/appUserWhere']('displayName', 'Lena Brown')).toEqual(mockAppUserData()[0]);
      });
    });

    describe('searchAppUser', () => {
      it('finds the app users where key equals value', () => {
        expect(store.getters['appUser/searchAppUser']('Lena')).toEqual([mockAppUserData()[0]]);
      });
    });
  });

  describe('>> Mutations', () => {
    describe('setAllUsers', () => {
      it('sets the allUsers array', () => {
        store = mockStore();
        store.commit('appUser/setAllUsers', mockAllUsersData());
        expect(store.state.appUser.allUsers).toEqual(mockAllUsersData());
      });
    });

    describe('setAppUsers', () => {
      it('sets the appUsers array', () => {
        store = mockStore();
        store.commit('appUser/setAppUsers', mockAppUserAzureData());
        expect(store.state.appUser.appUsers).toEqual(mockAppUserAzureData());
      });
    });

    describe('setRoles', () => {
      it('sets the roles array', () => {
        store = mockStore();
        store.commit('appUser/setRoles', mockRolesData());
        expect(store.state.appUser.roles).toEqual(mockRolesData());
      });
    });

    describe('invalidateAppUserCache', () => {
      it('changes appUsersFetched from true to false', async () => {
        store = mockStore();
        expect(store.state.appUser.appUsersFetched).toBeFalsy();
        await store.dispatch('appUser/fetchAppUsers');
        expect(store.state.appUser.appUsersFetched).toBeTruthy();

        // Set appUsersFetched back to false
        store.commit('appUser/invalidateAppUserCache');
        expect(store.state.appUser.appUsersFetched).toBeFalsy();
      });
    });

    describe('invalidateAllUserCache', () => {
      it('changes allUsersFetched from true to false', async () => {
        store = mockStore();
        expect(store.state.appUser.allUsersFetched).toBeFalsy();
        await store.dispatch('appUser/fetchAllUsers');
        expect(store.state.appUser.allUsersFetched).toBeTruthy();

        // Set allUsersFetched back to false
        store.commit('appUser/invalidateAllUserCache');
        expect(store.state.appUser.allUsersFetched).toBeFalsy();
      });
    });
  });

  describe('>> Actions', () => {
    describe('fetchAllUsers', () => {
      it('calls fetchAllUsers from appUser service and setAllUsers getters', async () => {
        const store = mockStore({}, { commit: true, dispatch: false });
        jest.spyOn(store.$services.appUsers, 'fetchAllUsers').mockImplementation(() => mockAllUsersData());

        await store.dispatch('appUser/fetchAllUsers');

        expect(store.$services.appUsers.fetchAllUsers).toHaveBeenCalledTimes(1);
        expect(store.commit).toHaveBeenCalledWith('appUser/setAllUsers', mockAllUsersData(), undefined);
      });

      it('sets allUsersFetched to true', async () => {
        expect(store.state.appUser.allUsersFetched).toBeFalsy();

        await store.dispatch('appUser/fetchAllUsers');

        expect(store.state.appUser.allUsersFetched).toBeTruthy();
      });
    });

    describe('fetchAppUsers', () => {
      it('calls fetchAppUsers from appUser service and setAppUsers getters', async () => {
        const store = mockStore({}, { commit: true, dispatch: false });
        jest.spyOn(store.$services.appUsers, 'fetchAppUsers').mockImplementation(() => mockAppUserAzureData());

        await store.dispatch('appUser/fetchAppUsers');

        expect(store.$services.appUsers.fetchAppUsers).toHaveBeenCalledTimes(1);
        expect(store.commit).toHaveBeenCalledWith('appUser/setAppUsers', mockAppUserAzureData(), undefined);
      });

      it('sets appUsersFetched to true', async () => {
        expect(store.state.appUser.appUsersFetched).toBeFalsy();

        await store.dispatch('appUser/fetchAppUsers');

        expect(store.state.appUser.appUsersFetched).toBeTruthy();
      });
    });

    describe('fetchRoles', () => {
      it('calls fetchRoles from appUser service and setRoles getters', async () => {
        const store = mockStore({}, { commit: true, dispatch: false });
        jest.spyOn(store.$services.appUsers, 'fetchRoles').mockImplementation(() => mockRolesData());

        await store.dispatch('appUser/fetchRoles');

        expect(store.$services.appUsers.fetchRoles).toHaveBeenCalledTimes(1);
        expect(store.commit).toHaveBeenCalledWith('appUser/setRoles', mockRolesData(), undefined);
      });

      it('sets rolesFetched to true', async () => {
        expect(store.state.appUser.rolesFetched).toBeFalsy();

        await store.dispatch('appUser/fetchRoles');

        expect(store.state.appUser.rolesFetched).toBeTruthy();
      });
    });

    describe('findAppUsers', () => {
      it('calls fetchRoles from appUser service and setRoles getters', async () => {
        const searchTerm = 'term';
        jest.spyOn(store.$services.appUsers, 'findAppUsers').mockImplementation(() => mockAppUserData());

        const result = await store.dispatch('appUser/findAppUsers', searchTerm);

        expect(store.$services.appUsers.findAppUsers).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockAppUserData());
      });
    });
  });
});
