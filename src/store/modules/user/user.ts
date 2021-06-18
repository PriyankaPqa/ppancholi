import {
  Store, Module, ActionContext, ActionTree,
} from 'vuex';
import { localStorageKeys } from '@/constants/localStorage';
import authenticationProvider from '@/auth/AuthenticationProvider';
import {
  IMSALUserData,
  User,
} from '@/entities/user';
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
});

const moduleState: IState = getDefaultState();

const getters = {
  user: (state: IState) => new User({
    oid: state.oid,
    family_name: state.family_name,
    given_name: state.given_name,
    email: state.email,
    roles: state.roles,
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
    state.oid = payload.oid;
    state.family_name = payload.family_name;
    state.given_name = payload.given_name;
    state.email = payload.email || payload.preferred_username;
    state.roles = payload.roles;
  },

  setRole(state: IState, payload: string) {
    state.roles = [payload];
  },
};

const actions = {
  async signOut(this: Store<IState>) {
    authenticationProvider.signOut();
  },

  async fetchUserData(this: Store<IState>, context: ActionContext<IState, IState>) {
    const accessTokenResponse = await authenticationProvider.acquireToken();

    if (accessTokenResponse?.accessToken) {
      localStorage.setItem(localStorageKeys.accessToken.name, accessTokenResponse.accessToken);
      const { account } = accessTokenResponse;
      const userData = account.idTokenClaims;
      context.commit('setUser', userData);
    } else {
      throw new Error('User data not found');
    }
  },
};

export const user: Module<IState, IRootState> = {
  namespaced: true,
  state: moduleState as IState,
  getters,
  mutations,
  actions: actions as unknown as ActionTree<IState, IRootState>,
};
