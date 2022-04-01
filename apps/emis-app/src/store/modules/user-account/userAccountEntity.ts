import { ActionContext, ActionTree } from 'vuex';
import _sortBy from 'lodash/sortBy';
import applicationInsights from '@libs/core-lib/plugins/applicationInsights/applicationInsights';
import { EOptionLists, IOptionItem, OptionItem } from '@/entities/optionItem';
import {
  IFilter, IUserAccountEntity, FilterKey, UserAccountEntity,
} from '@/entities/user-account';
import { IAddRoleToUserRequest, IEditFilterRequest, UserAccountsService } from '@/services/user-accounts/entity';
import { IUserAccountEntityState } from '@/store/modules/user-account/userAccountEntity.types';
import { OptionItemsService } from '@/services/optionItems';
import { BaseModule } from '../base';
import { IRootState } from '../../store.types';

import { IState } from '../base/base.types';

export class UserAccountEntityModule extends BaseModule <IUserAccountEntity, uuid> {
  constructor(readonly service: UserAccountsService, readonly optionsService:OptionItemsService) {
    super(service);
  }

  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
    actions: this.actions as unknown as ActionTree<IState<IUserAccountEntity>, IRootState>,
  })

  public state = {
    ...this.baseState,
    currentUserAccount: null as IUserAccountEntity,
    roles: [] as IOptionItem[],
    rolesFetched: false,
  }

  public getters = {
    ...this.baseGetters,
    currentUserFiltersByKey: (state: IUserAccountEntityState) => (key: FilterKey) => {
      if (state.currentUserAccount) {
        const userAccount = new UserAccountEntity(state.currentUserAccount);
        return userAccount.filters.filter((f: IFilter) => f.filterKey === key);
      }
      return [];
    },

    roles: (state: IUserAccountEntityState) => (state.roles ? _sortBy(state.roles.map((e) => new OptionItem(e)), 'orderRank') : []),
  }

  public mutations = {
    ...this.baseMutations,
    setCurrentUserAccount: (state: IUserAccountEntityState, entity: IUserAccountEntity) => {
      state.currentUserAccount = entity;
    },

    setRoles(state: IUserAccountEntityState, payload: Array<IOptionItem>) {
      state.roles = payload;
    },

    setRolesFetched(state: IUserAccountEntityState, payload: boolean) {
      state.rolesFetched = payload;
    },
  }

  public actions = {
    ...this.baseActions,

    genericFilterAction: async (
      context: ActionContext<IUserAccountEntityState, IUserAccountEntityState>,
      { payload, methodName }: {payload: IFilter | IEditFilterRequest, methodName: string},
    ): Promise<IUserAccountEntity> => {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const res = await this.service[methodName](payload);
        context.commit('set', res);
        return res;
      } catch (e) {
        applicationInsights.trackException(e, { payload }, 'module.userAccountEntity', 'genericFilterAction');
        return null;
      }
    },

    async addFilter(
      context: ActionContext<IUserAccountEntityState, IUserAccountEntityState>,
      filter: IFilter,
    ): Promise<IUserAccountEntity> {
      return context.dispatch('genericFilterAction', { payload: filter, methodName: 'addFilter' });
    },

    async editFilter(
      context: ActionContext<IUserAccountEntityState, IUserAccountEntityState>,
      payload: IEditFilterRequest,
    ): Promise<IUserAccountEntity> {
      return context.dispatch('genericFilterAction', { payload, methodName: 'editFilter' });
    },

    async deleteFilter(
      context: ActionContext<IUserAccountEntityState, IUserAccountEntityState>,
      filter: IFilter,
    ): Promise<IUserAccountEntity> {
      return context.dispatch('genericFilterAction', { payload: filter, methodName: 'deleteFilter' });
    },

    assignRole: async (
      context: ActionContext<IUserAccountEntityState, IUserAccountEntityState>,
      payload: IAddRoleToUserRequest,
    ): Promise<IUserAccountEntity> => {
      try {
        const res = await this.service.assignRole(payload);
        context.commit('set', res);
        return res;
      } catch (e) {
        applicationInsights.trackException(e, { payload }, 'module.userAccountEntity', 'assignRole');
        return null;
      }
    },

    fetchCurrentUserAccount: async (
      context: ActionContext<IUserAccountEntityState, IUserAccountEntityState>,
    ): Promise<IUserAccountEntity> => {
      try {
        const res = await this.service.fetchCurrentUserAccount();
        context.commit('setCurrentUserAccount', res);
        return res;
      } catch (e) {
        applicationInsights.trackException(e, {}, 'module.userAccountEntity', 'fetchCurrentUserAccount');
        return null;
      }
    },

    fetchRoles: async (
      context: ActionContext<IUserAccountEntityState, IUserAccountEntityState>,
    ): Promise<IOptionItem[]> => {
      if (!this.state.rolesFetched) {
        const data = await this.optionsService.getOptionList(EOptionLists.Roles);
        context.commit('setRoles', data);
        context.commit('setRolesFetched', true);
      }

      return context.getters.roles;
    },

  };
}
