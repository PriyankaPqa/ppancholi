import {
  Store, Module, ActionContext, ActionTree,
} from 'vuex';
import { localStorageKeys } from '@/constants/localStorage';
import authenticationProvider from '@/auth/AuthenticationProvider';
import { IUserData, User } from '@/entities/user';
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
};

const mutations = {
  setUser(state: IState, payload: IUserData) {
    state.oid = payload.oid;
    state.family_name = payload.family_name;
    state.given_name = payload.given_name;
    state.email = payload.email;
    state.roles = payload.roles;
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
