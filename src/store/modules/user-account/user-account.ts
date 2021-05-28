import {
  Store, Module, ActionContext, ActionTree,
} from 'vuex';
import _findIndex from 'lodash/findIndex';
import {
  UserAccount,
  IUserAccount,
  IUserAccountSearchData,
  IUserAccountData,
  EAccountStatus,
  EUserAccountStatus,
} from '@/entities/user-account';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { IAddRoleToUserRequest } from '@/services/user-accounts';
import helpers from '@/ui/helpers';
import _cloneDeep from 'lodash/cloneDeep';
import { IRootState } from '../../store.types';
import {
  IState,
} from './user-account.types';
import { mapUserAccountToSearchData } from './user-account-utils';

const getDefaultState = (): IState => ({
  userAccounts: [],
  searchLoading: false,
});

const moduleState: IState = getDefaultState();

const getters = {

  // eslint-disable-next-line
  userAccounts: (state: IState) => state.userAccounts,

  userAccountById: (state: IState) => (id: uuid): IUserAccount => {
    const userAccount = state.userAccounts.find((u) => u.userAccountId === id);
    if (userAccount) {
      return new UserAccount(userAccount);
    }
    return null;
  },

  userAccountSearchDataById: (state: IState) => (id: uuid): IUserAccountSearchData => state.userAccounts.find(
    (u) => (u as unknown as UserAccount).id === id,
  ),

  searchUserAccounts:
    (state: IState) => (search: string, searchAmong: [string]) => helpers.filterCollectionByValue(state.userAccounts, search, false, searchAmong),
};

const mutations = {

  addOrUpdateUserAccount(state: IState, payload: IUserAccountSearchData) {
    const index = _findIndex(state.userAccounts as unknown as IUserAccount[], { id: payload.userAccountId });

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

  setUserAccounts(state: IState, payload: Array<IUserAccountSearchData>) {
    state.userAccounts = payload;
  },

  deleteUserAccount(state: IState, userId: string) {
    state.userAccounts = state.userAccounts.filter((u) => (u as unknown as IUserAccount).id !== userId);
  },
};

const actions = {
  async searchUserAccounts(this: Store<IState>, context: ActionContext<IState, IState>, params: IAzureSearchParams)
  : Promise<IAzureSearchResult<IUserAccount>> {
    try {
      context.commit('setSearchLoading', true);
      const res = await this.$services.userAccounts.searchUserAccounts(params);
      const data = res?.value;

      data.forEach((a) => context.commit('addOrUpdateUserAccount', a));

      return {
        ...res,
        value: data.map((a: IUserAccountSearchData) => new UserAccount(a)),
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

  async addRoleToUser(this: Store<IState>, context: ActionContext<IState, IState>, role: IAddRoleToUserRequest): Promise<IUserAccountData> {
    const payload: IUserAccountData = await this.$services.userAccounts.addRoleToUser(role);
    const user: IUserAccountSearchData = mapUserAccountToSearchData(payload, context, payload.id);
    user.roleId = role.subRole.id;
    user.roleName = role.subRole.name;
    user.userAccountStatus = payload.status;
    user.accountStatus = payload.accountStatus;
    user.userAccountId = payload.id;
    (user as unknown as IUserAccount).id = payload.id; // Required for round-trip
    context.commit('addOrUpdateUserAccount', user);

    return payload;
  },

  async fetchAllUserAccounts(this: Store<IState>, context: ActionContext<IState, IState>):Promise<IUserAccount[]> {
    let value: IUserAccount[];
    const result = await this.$services.userAccounts.fetchAllUserAccounts();
    const data = result?.value;
    if (data) {
      value = data.map((a: IUserAccountSearchData) => new UserAccount(a));
    } else {
      value = [];
    }
    context.commit('setUserAccounts', value);

    return context.getters.userAccounts;
  },

  async deleteUserAccount(this: Store<IState>, context: ActionContext<IState, IState>, userId: string) {
    await this.$services.userAccounts.deleteUserAccount(userId);

    const deletedUser = _cloneDeep(context.state.userAccounts.find((account) => account.userAccountId === userId) as IUserAccountSearchData);
    if (deletedUser) {
      deletedUser.accountStatus = EAccountStatus.Disabled;
      deletedUser.userAccountStatus = EUserAccountStatus.Inactive;
      context.commit('addOrUpdateUserAccount', deletedUser);
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
