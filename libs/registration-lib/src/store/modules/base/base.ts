import { ActionContext, ActionTree } from 'vuex';
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import { IAzureSearchParams, IAzureCombinedSearchResult } from '@libs/shared-lib/types';
import { DomainBaseService } from '@libs/services-lib/base';
import { IEntity } from '@libs/entities-lib/base';
import helpers from '@libs/entities-lib/helpers';
import { IRootState } from '../../store.types';
import { IState } from './base.types';

export class BaseModule<T extends IEntity, IdParams> {
  constructor(protected service: DomainBaseService<T, IdParams>) {}

  // Add or edit an item if the one pass as parameter is newer than existing one
  private upsert(state: IState<T>, item: T) {
    if (item == null) {
      return;
    }
    const index = state.items.findIndex((x) => x?.id === item.id);
    const stateItem = state.items[index];

    if (stateItem == null) {
      state.items.push(item);
    } else if (stateItem.timestamp < item.timestamp) {
      Vue.set(state.items, index, item);
    }
  }

  protected baseState = {
    items: [] as Array<T>,
    newlyCreatedIds: [] as Array<{ id: uuid; createdOn: number }>,
    searchLoading: false,
    actionLoading: false,
    maxTimeInSecondsForNewlyCreatedIds: 60,
  };

  protected baseGetters = {
    getAll: (state: IState<T>) => _cloneDeep(state.items),
    get: (state: IState<T>) => (id: uuid) => _cloneDeep(state.items.find((e) => e.id === id)) || {},
    // eslint-disable-next-line
    getByCriteria: (state:IState<T>) => (query: string, searchAll: boolean, searchAmong: string[]) => helpers.filterCollectionByValue(state.items, query, searchAll, searchAmong),
    getByIds: (state: IState<T>) => (ids: uuid[]) => ids.map((id) => _cloneDeep(state.items.find((e) => e.id === id))),
    getNewlyCreatedIds: (state:IState<T>) => (baseDate?: Date) => {
      const maxTime = (baseDate || new Date()).getTime() - state.maxTimeInSecondsForNewlyCreatedIds * 1000;
      return _cloneDeep(state.newlyCreatedIds.filter((i) => i.createdOn > maxTime));
    },
  };

  protected baseActions = {
    fetch: async (context: ActionContext<IState<T>, IState<T>>, { idParams, useGlobalHandler }: { idParams: IdParams; useGlobalHandler: boolean }): Promise<T> => {
      const res = await this.service.get(idParams, useGlobalHandler);
      context.commit('set', res);
      return res;
    },

    fetchAll: async (context: ActionContext<IState<T>, IState<T>>): Promise<T[]> => {
      const res = await this.service.getAll();
      context.commit('setAll', res);
      return res;
    },

    fetchAllIncludingInactive: async (context: ActionContext<IState<T>, IState<T>>): Promise<T[]> => {
      const res = await this.service.getAllIncludingInactive();
      context.commit('setAll', res);
      return res;
    },

    deactivate: async (context: ActionContext<IState<T>, IState<T>>, idParams: IdParams): Promise<T> => {
      const res = await this.service.deactivate(idParams);
      context.commit('set', res);
      return res;
    },

    activate: async (context: ActionContext<IState<T>, IState<T>>, idParams: IdParams): Promise<T> => {
      const res = await this.service.activate(idParams);
      context.commit('set', res);
      return res;
    },

    search: async (context: ActionContext<IState<T>, IState<T>>, { params, searchEndpoint }: { params: IAzureSearchParams; searchEndpoint?: string }):
      Promise<IAzureCombinedSearchResult<T, unknown>> => {
      const res = await this.service.search(params, searchEndpoint);
      return res;
    },
  };

  protected baseMutations = {

    addNewlyCreatedId: (state: IState<T>, item: T) => {
      if (!state.newlyCreatedIds.find((n) => n.id === item.id)) {
        state.newlyCreatedIds.unshift({ id: item.id, createdOn: (new Date()).getTime() });
      }
    },

    set: (state: IState<T>, item: T) => {
      this.upsert(state, item);
    },

    setAll: (state: IState<T>, payload: Array<T>) => {
      (payload || []).forEach((item) => this.upsert(state, item));
    },

    upsert: (state: IState<T>, item: T) => {
      this.upsert(state, item);
    },

    setSearchLoading(state: IState<T>, payload: boolean) {
      state.searchLoading = payload;
    },

    reset: (state: IState<T>) => {
      state.items = [];
    },
  };

  public getModule = () => ({
    namespaced: true,
    state: this.baseState,
    getters: this.baseGetters,
    actions: this.baseActions as unknown as ActionTree<IState<T>, IRootState>,
    mutations: this.baseMutations,
  });
}
