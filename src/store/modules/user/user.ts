import {
  Store, Module, ActionContext, ActionTree,
} from 'vuex';
import { User } from '../../../entities/user';
import { IRootState } from '../../store.types';
import {
  IState, IActions, IGetters, IMutations,
} from './user.types';

const getDefaultState = (): IState => ({
  oid: '',
  family_name: '',
  given_name: '',
  email: '',
  roles: [],
});

const moduleState: IState = getDefaultState();

const getters: IGetters = {
  user: (state: IState) => new User({
    oid: state.oid,
    family_name: state.family_name,
    given_name: state.given_name,
    email: state.email,
    roles: state.roles,
  }),
};

const mutations: IMutations = {
  setUser(state: IState, payload) {
    state.oid = payload.oid;
    state.family_name = payload.family_name;
    state.given_name = payload.given_name;
    state.email = payload.email;
    state.roles = payload.roles;
  },
};

const actions: IActions = {
  async signOut(this: Store<IState>) {
    // TODO: Setting the current role to null before redirecting to the signout page causing dashboard to be displayed empty.
    // https://rctech.atlassian.net/browse/EMISDEV-5703
    await this.$services.authentications.signOut();
  },
  async fetchUserData(this: Store<IState>, context: ActionContext<IState, IState>) {
    console.log('Fetch User called');
    const accessTokenResponse = await this.$services.authentications.getAccessToken();
    if (accessTokenResponse?.accessToken) {
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
