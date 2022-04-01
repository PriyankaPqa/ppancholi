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
import { localStorageKeys } from '@/constants/localStorage';
import { IRootState } from '../../store.types';
import {
  IState,
} from './user.types';

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
      state.roles = payload.roles;
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
    await AuthenticationProvider.acquireToken('fetchUserData');
    const accessToken = localStorage.getItem(localStorageKeys.accessToken.name) || AuthenticationProvider.accessToken;
    if (accessToken) {
      const account = JSON.parse(localStorage.getItem(localStorageKeys.msalAccount.name)) || AuthenticationProvider.account;

      const userData = { ...account.idTokenClaims, homeAccountId: account.homeAccountId } as IMSALUserData;
      userData.roles = helpers.decodeJwt(accessToken).roles;
      context.commit('setUser', userData);
    } else {
      applicationInsights.trackTrace('User data not found', null, 'user', 'fetchUserData');
    }
    return !!accessToken;
  },
};

export const user: Module<IState, IRootState> = {
  namespaced: true,
  state: moduleState as IState,
  getters,
  mutations,
  actions: actions as unknown as ActionTree<IState, IRootState>,
};
