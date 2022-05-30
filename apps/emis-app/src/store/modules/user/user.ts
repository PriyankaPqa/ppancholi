import Vue from 'vue';
import {
  Store, Module, ActionContext, ActionTree,
} from 'vuex';
import applicationInsights from '@libs/core-lib/plugins/applicationInsights/applicationInsights';
import AuthenticationProvider from '@/auth/AuthenticationProvider';
import {
  IMSALUserData,
  User,
} from '@/entities/user';
import helpers from '@/ui/helpers/helpers';
import { i18n } from '@/ui/plugins';
import { IRootState } from '../../store.types';
import {
  IState,
} from './user.types';
import userHelpers from './userHelpers';

const getDefaultState = (): IState => ({
  oid: '',
  family_name: '',
  given_name: '',
  email: '',
  roles: [],
  homeAccountId: '',
});

const moduleState: IState = getDefaultState();

const getters = {
  user: (state: IState) => new User({
    oid: state.oid,
    family_name: state.family_name,
    given_name: state.given_name,
    email: state.email,
    roles: state.roles,
    homeAccountId: state.homeAccountId,
  }),

  userId: (state: IState) => state.oid,

  landingPage(state: IState) {
    const user = new User(state);
    const role = user.currentRole();

    switch (role) {
      case 'level1':
      case 'level2':
      case 'contributorIM':
      case 'contributorFinance':
      case 'contributor3':
      case 'readonly':
        return 'DashboardCaseFile';
      case 'level3': return 'HomeLevel3';
      case 'level4': return 'HomeLevel4';
      case 'level5': return 'HomeLevel5';
      case 'level6': return 'HomeLevel6';
      default: return 'HomeNoRole';
    }
  },
};

const mutations = {
  setUser(state: IState, payload: IMSALUserData) {
    if (state.oid !== payload.oid || (state.email !== (payload.email || payload.preferred_username))) {
      state.oid = payload.oid;
      state.email = payload.email || payload.preferred_username;
      applicationInsights.setUserId(`${state.email}_${payload.oid}`);
      applicationInsights.setBasicContext({ name: state.email });
      applicationInsights.setBasicContext({ uid: state.oid });
    }

    state.family_name = payload.family_name;
    state.given_name = payload.given_name;
    state.homeAccountId = payload.homeAccountId;

    if (payload?.roles && state.roles[0] !== payload.roles[0]) {
      state.roles = [...payload.roles];
      applicationInsights.setBasicContext({ roles: state.roles });
    }
  },

  setRole(state: IState, payload: string) {
    if (state.roles[0] !== payload) {
      state.roles = [payload];
      applicationInsights.setBasicContext({ roles: state.roles });
    }
  },
};

const actions = {
  async signOut(this: Store<IState>) {
    await AuthenticationProvider.signOut();
  },

  async fetchUserData(this: Store<IState>, context: ActionContext<IState, IState>) {
    const currentRoles = await context.dispatch('getCurrentRoles');

    if (currentRoles) {
      const userData = userHelpers.getUserData(currentRoles);
      if (userData) {
        context.commit('setUser', userData);
      }
      return !!userData;
    }

    applicationInsights.trackTrace('User data not valid', null, 'user', 'fetchUserData');
    // A user's role is only valid if it is the same as their previous roles. If the current roles are different from the previous roles,
    // they are not valid, so the user needs to be logged out. An error message will be displayed to the user for 2 seconds before the automatic log out.
    Vue.toasted.global.error(i18n.t('errors.access-change.log-out'));
    await helpers.timeout(2000);
    AuthenticationProvider.signOut();
    // Add a timer to give time to the sign out page to load, otherwise our own login error page will flicker on the screen right before when this function returns null (bad UX)
    await helpers.timeout(2000);
    return null;
  },

  async getCurrentRoles(this: Store<IState>, context: ActionContext<IState, IState>): Promise<string[] | null> {
    const previousRoles = context.state.roles;
    const currentToken = await AuthenticationProvider.acquireToken('fetchUserData', true);

    if (currentToken) {
      const currentRoles = helpers.decodeJwt(currentToken).roles;
      const roleDidNotChange = userHelpers.isSameRole(currentRoles, previousRoles);

      // A user's roles are only valid if it hasn't changed from their previous roles.
      if (!previousRoles.length || roleDidNotChange) {
        return currentRoles;
      }
      return null;
    }
    return null;
  },

};

export const user: Module<IState, IRootState> = {
  namespaced: true,
  state: moduleState as IState,
  getters,
  mutations,
  actions: actions as unknown as ActionTree<IState, IRootState>,
};
