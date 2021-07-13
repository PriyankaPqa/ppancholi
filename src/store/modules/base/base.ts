import { DomainBaseService } from '@/services/base';
import { IEntity } from '@/entities/base/base.types';
import { ActionContext, ActionTree } from 'vuex';
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import helpers from '@/ui/helpers';
import { IAzureSearchParams } from '@/types';
import { IAzureCombinedSearchResult } from '@/types/interfaces/IAzureSearchResult';
import { IRootState } from '../../store.types';
import { IState } from './base.types';

export class BaseModule<T extends IEntity> {
  constructor(protected service: DomainBaseService<T>) {}

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
  }

  protected baseGetters = {
    getAll: (state:IState<T>) => _cloneDeep(state.items),
    get: (state:IState<T>) => (id: uuid) => _cloneDeep(state.items.find((e) => e.id === id) || {}),
    // eslint-disable-next-line
    getByCriteria: (state:IState<T>) => (query: string, searchAll: boolean, searchAmong: string[]) => helpers.filterCollectionByValue(state.items, query, searchAll, searchAmong),
    getByIds: (state:IState<T>) => (ids: uuid[]) => ids.map((id) => _cloneDeep(state.items.find((e) => e.id === id)) || {}),
  }

  protected baseActions = {
    fetch: async (context: ActionContext<IState<T>, IState<T>>, { id, useGlobalHandler }: {id: uuid, useGlobalHandler: boolean}): Promise<T> => {
      try {
        const res = await this.service.get(id, useGlobalHandler);
        if (res) {
          context.commit('set', res);
        }
        return res;
      } catch (e) {
        return null;
      }
    },

    fetchAll: async (context: ActionContext<IState<T>, IState<T>>): Promise<T[]> => {
      try {
        const res = await this.service.getAll();
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

    deactivate: async (context: ActionContext<IState<T>, IState<T>>, id: uuid): Promise<T> => {
      try {
        const res = await this.service.deactivate(id);
        context.commit('set', res);
        return res;
      } catch (e) {
        return null;
      }
    },

    activate: async (context: ActionContext<IState<T>, IState<T>>, id: uuid): Promise<T> => {
      try {
        const res = await this.service.activate(id);
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

  }

  public getModule = () => ({
    namespaced: true,
    state: this.baseState,
    getters: this.baseGetters,
    actions: this.baseActions as unknown as ActionTree<IState<T>, IRootState>,
    mutations: this.baseMutations,
  })
}
