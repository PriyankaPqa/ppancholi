import {
  Store, Module, ActionContext, ActionTree,
} from 'vuex';
import { IRootState } from '@/store/store.types';
import {
  IAllUserData, IRolesData, IAppUserAzureData,
} from '@/entities/app-user';

import helpers from '@/ui/helpers';
import _cloneDeep from 'lodash/cloneDeep';
import {
  IState,
} from './app-user.types';

const getDefaultState = (): IState => ({
  allUsers: [],
  appUsers: [],
  roles: [],
  allUsersFetched: false,
  appUsersFetched: false,
  rolesFetched: false,
});

const moduleState: IState = getDefaultState();

const getters = {
  appUsersWithInfo(state: IState) {
    const appUsers = _cloneDeep(state.appUsers);
    return appUsers.map((appUser) => {
      // We find corresponding user matching on id
      const allUserData = state.allUsers.find((u) => u.id === appUser.id);

      // We find roles info for each roles of the user
      (appUser.roles as unknown as IRolesData[]) = appUser.roles.map((id) => state.roles.find((role) => role.id === id));

      return { ...appUser, ...allUserData };
    });
  },
  // Find a user by passing the key we are looking for and the value
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appUserWhere: (state: IState, getters: any) => (key: string, value: string) => getters.appUsersWithInfo.find((o: never) => o[key] === value),

  // Find all app users whose display name contains the search term
  // eslint-disable-next-line
  searchAppUser: (state: IState, getters: any) => (searchTerm: string, searchAll = true, searchAmong: Array<string>) => helpers.filterCollectionByValue(getters.appUsersWithInfo, searchTerm, searchAll, searchAmong),
};

const mutations = {
  setAllUsers(state: IState, payload: Array<IAllUserData>) {
    state.allUsers = payload;
  },

  setAppUsers(state: IState, payload: Array<IAppUserAzureData>) {
    state.appUsers = payload;
  },

  setRoles(state: IState, payload: Array<IRolesData>) {
    state.roles = payload;
  },

  setAllUsersFetched(state: IState, payload: boolean) {
    state.allUsersFetched = payload;
  },

  setAppUsersFetched(state: IState, payload: boolean) {
    state.appUsersFetched = payload;
  },

  setRolesFetched(state: IState, payload: boolean) {
    state.rolesFetched = payload;
  },

};

const actions = {
  async fetchAllUsers(this: Store<IState>, context: ActionContext<IState, IState>) {
    if (!context.state.allUsersFetched) {
      const data = await this.$services.appUsers.fetchAllUsers();
      context.commit('setAllUsers', data);
    }
    context.commit('setAllUsersFetched', true);
    return context.state.allUsers;
  },

  async fetchAppUsers(this: Store<IState>, context: ActionContext<IState, IState>) {
    if (!context.state.appUsersFetched) {
      const data = await this.$services.appUsers.fetchAppUsers();
      context.commit('setAppUsers', data);
    }
    context.commit('setAppUsersFetched', true);
    return context.state.appUsers;
  },

  async fetchRoles(this: Store<IState>, context: ActionContext<IState, IState>) {
    if (!context.state.rolesFetched) {
      const data = await this.$services.appUsers.fetchRoles();
      context.commit('setRoles', data);
    }
    context.commit('setRolesFetched', true);
    return context.state.roles;
  },
};

export const appUser: Module<IState, IRootState> = {
  namespaced: true,
  state: moduleState as IState,
  getters,
  mutations,
  actions: actions as unknown as ActionTree<IState, IRootState>,
};
