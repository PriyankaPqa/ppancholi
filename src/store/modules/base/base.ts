import { ActionContext, ActionTree } from 'vuex';
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import { IEntity, Status } from '@/entities/base/base.types';
import { DomainBaseService } from '@/services/base';
import helpers from '@/ui/helpers';
import { IAzureCombinedSearchResult, IAzureSearchParams } from '@/types';
import { IRootState } from '../../store.types';
import { IState } from './base.types';

export class BaseModule<T extends IEntity, IdParams> {
  constructor(protected service: DomainBaseService<T, IdParams>) {}

  // Add or edit an item if the one pass as parameter is newer than existing one
  private upsert(state: IState<T>, item: T) {
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
    searchLoading: false,
  }

  protected baseGetters = {
    getAll: (state:IState<T>) => _cloneDeep(state.items),
    get: (state:IState<T>) => (id: uuid) => _cloneDeep(state.items.find((e) => e.id === id) || {}),
    // eslint-disable-next-line
    getByCriteria: (state:IState<T>) => (query: string, searchAll: boolean, searchAmong: string[]) => helpers.filterCollectionByValue(state.items, query, searchAll, searchAmong),
    getByIds: (state:IState<T>) => (ids: uuid[], onlyActive?: boolean) => {
      if (onlyActive) {
        return ids.map((id) => _cloneDeep(state.items.find((e) => e.id === id && e.status === Status.Active)) || {});
      }
      return ids.map((id) => _cloneDeep(state.items.find((e) => e.id === id)) || {});
    },
  }

  protected baseActions = {
    fetch: async (context: ActionContext<IState<T>, IState<T>>, { idParams, useGlobalHandler }: {idParams: IdParams, useGlobalHandler: boolean})
    : Promise<T> => {
      try {
        const res = await this.service.get(idParams, useGlobalHandler);
        if (res) {
          context.commit('set', res);
        }
        return res;
      } catch (e) {
        return null;
      }
    },

    fetchAll: async (context: ActionContext<IState<T>, IState<T>>, parentId?: Omit<IdParams, 'id'>): Promise<T[]> => {
      try {
        const res = await this.service.getAll(parentId);
        if (res) {
          context.commit('setAll', res);
        }
        return res;
      } catch (e) {
        return null;
      }
    },

    fetchAllIncludingInactive: async (context: ActionContext<IState<T>, IState<T>>): Promise<T[]> => {
      try {
        const res = await this.service.getAllIncludingInactive();
        context.commit('setAll', res);
        return res;
      } catch (e) {
        return null;
      }
    },

    deactivate: async (context: ActionContext<IState<T>, IState<T>>, idParams: IdParams): Promise<T> => {
      try {
        const res = await this.service.deactivate(idParams);
        context.commit('set', res);
        return res;
      } catch (e) {
        return null;
      }
    },

    activate: async (context: ActionContext<IState<T>, IState<T>>, idParams: IdParams): Promise<T> => {
      try {
        const res = await this.service.activate(idParams);
        context.commit('set', res);
        return res;
      } catch (e) {
        return null;
      }
    },

    search: async (context: ActionContext<IState<T>, IState<T>>, { params, searchEndpoint }: {params: IAzureSearchParams, searchEndpoint?: string}):
      Promise<IAzureCombinedSearchResult<T, unknown>> => {
      const res = await this.service.search(params, searchEndpoint);
      return res;
    },
  }

  protected baseMutations = {

    set: (state: IState<T>, item: T) => {
      this.upsert(state, item);
    },

    setAll: (state: IState<T>, payload: Array<T>) => {
      payload.forEach((item) => this.upsert(state, item));
    },

    upsert: (state: IState<T>, item: T) => {
      this.upsert(state, item);
    },

    setSearchLoading(state: IState<T>, payload: boolean) {
      state.searchLoading = payload;
    },

  }

  public getModule = () => ({
    namespaced: true,
    state: this.baseState,
    getters: this.baseGetters,
    actions: this.baseActions as unknown as ActionTree<IState<T>, IRootState>,
    mutations: this.baseMutations,
  })
}
