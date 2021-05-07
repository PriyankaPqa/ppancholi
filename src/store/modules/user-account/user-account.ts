import {
  Store, Module, ActionContext, ActionTree,
} from 'vuex';
import _findIndex from 'lodash/findIndex';

import {
  UserAccount,
  IUserAccount,
  IUserAccountSearchData,
} from '@/entities/user-account';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

import { IRootState } from '../../store.types';
import {
  IState,
} from './user-account.types';

const getDefaultState = (): IState => ({
  userAccounts: [],
  searchLoading: false,
  userAccountsFetched: false,
});

const moduleState: IState = getDefaultState();

const getters = {

  userAccountById: (state: IState) => (id: uuid): IUserAccount => {
    const userAccount = state.userAccounts.find((u) => u.userAccountId === id);
    if (userAccount) {
      return new UserAccount(userAccount);
    }
    return null;
  },

};

const mutations = {

  addOrUpdateUserAccount(state: IState, payload: IUserAccountSearchData) {
    const index = _findIndex(state.userAccounts, { userAccountId: payload.userAccountId });

    if (index > -1) {
      state.userAccounts = [
        ...state.userAccounts.slice(0, index),
        payload,
        ...state.userAccounts.slice(index + 1),
      ];
    } else {
      state.userAccounts.push(payload);
    }
  },

  setSearchLoading(state: IState, payload: boolean) {
    state.searchLoading = payload;
  },

};

const actions = {
  async searchUserAccounts(this: Store<IState>, context: ActionContext<IState, IState>, params: IAzureSearchParams)
  : Promise<IAzureSearchResult<IUserAccount>> {
    try {
      context.commit('setSearchLoading', true);
      const res = await this.$services.userAccounts.searchUserAccounts(params);
      const data = res?.value;

      const value = data.map((a: IUserAccountSearchData) => new UserAccount(a));

      value.forEach((a) => context.commit('addOrUpdateUserAccount', a));

      return {
        ...res,
        value,
      };
    } finally {
      context.commit('setSearchLoading', false);
    }
  },

  async fetchUserAccount(this: Store<IState>, context: ActionContext<IState, IState>, id: uuid): Promise<IUserAccount> {
    const userAccount = context.state.userAccounts.find((account) => account.userAccountId === id);

    if (userAccount) {
      return new UserAccount(userAccount);
    }

    try {
      context.commit('setSearchLoading', true);
      const params = { filter: { UserAccountId: id } };
      const res = await this.$services.userAccounts.searchUserAccounts(params);
      if (res?.value.length === 1) {
        const data = res.value[0];
        context.commit('addOrUpdateUserAccount', data);
        return new UserAccount(data);
      }
      return null;
    } finally {
      context.commit('setSearchLoading', false);
    }
  },

};

export const userAccount: Module<IState, IRootState> = {
  namespaced: true,
  state: moduleState as IState,
  getters,
  mutations,
  actions: actions as unknown as ActionTree<IState, IRootState>,
};
