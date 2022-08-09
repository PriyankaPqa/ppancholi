import { ActionContext, ActionTree } from 'vuex';
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { DomainBaseService } from '@libs/services-lib/base';
import helpers from '@/ui/helpers/helpers';
import { IAzureCombinedSearchResult, IAzureSearchParams } from '@libs/shared-lib/types';
import { ISignalRMock } from '@/ui/plugins/signal-r/signalR.types';
import { SignalR } from '@/ui/plugins/signal-r/signalR';
import { IRestResponse } from '@libs/services-lib/http-client';
import { IEntity, Status } from '@libs/entities-lib/base';
import { IRootState } from '../../store.types';
import { IState } from './base.types';

export class BaseModule<T extends IEntity, IdParams> {
  constructor(protected service: DomainBaseService<T, IdParams>, protected signalR: typeof SignalR | ISignalRMock) {}

  // Add or edit an item if the one pass as parameter is newer than existing one
  private upsert(state: IState<T>, item: T) {
    if (!item) {
      return;
    }
    const index = state.items.findIndex((x) => x?.id === item.id);
    const stateItem = state.items[index];

    if (stateItem == null) {
      state.items.push(item);
    } else if (stateItem.timestamp < item.timestamp) {
      Vue.set(state.items, index, item);
    }
    this.signalR.instance.addSubscription(item.id);
  }

  protected baseState = {
    items: [] as Array<T>,
    newlyCreatedIds: [] as Array<{id: uuid, createdOn: number}>,
    searchLoading: false,
    maxTimeInSecondsForNewlyCreatedIds: 60,
  }

  protected baseGetters = {
    getNewlyCreatedIds: (state:IState<T>) => (baseDate?: Date) => {
      const maxTime = (baseDate || new Date()).getTime() - state.maxTimeInSecondsForNewlyCreatedIds * 1000;
      return _cloneDeep(state.newlyCreatedIds.filter((i) => i.createdOn > maxTime));
    },
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
    fetch: async (
      context: ActionContext<IState<T>, IState<T>>,
      { idParams, useGlobalHandler, returnFullResponse }: {idParams: IdParams, useGlobalHandler: boolean, returnFullResponse?: boolean},
    )
    : Promise<T | IRestResponse<T>> => {
      try {
        let res;
        if (!returnFullResponse) {
          res = await this.service.get(idParams, useGlobalHandler);
          if (res) {
            context.commit('set', res);
          }
        } else {
          res = await this.service.getFullResponse(idParams, useGlobalHandler);
          if (res.data) {
            context.commit('set', res.data);
          }
        }
        return res;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        const error = e.response?.data?.errors;
        // normal errors already logged in service.get
        // when e is an array returned from BE (a validation error or 404)
        if (error && !Array.isArray(error)) {
          applicationInsights.trackException(error, { idParams }, 'module.base', 'fetch');
        }
        return returnFullResponse ? e.response : null;
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
        applicationInsights.trackException(e, { parentId }, 'module.base', 'fetchAll');
        return null;
      }
    },

    fetchAllIncludingInactive: async (context: ActionContext<IState<T>, IState<T>>): Promise<T[]> => {
      try {
        const res = await this.service.getAllIncludingInactive();
        context.commit('setAll', res);
        return res;
      } catch (e) {
        applicationInsights.trackException(e, {}, 'module.base', 'fetch');
        return null;
      }
    },

    deactivate: async (context: ActionContext<IState<T>, IState<T>>, idParams: IdParams): Promise<T> => {
      try {
        const res = await this.service.deactivate(idParams);
        context.commit('set', res);
        return res;
      } catch (e) {
        applicationInsights.trackException(e, { idParams }, 'module.base', 'deactivate');
        return null;
      }
    },

    activate: async (context: ActionContext<IState<T>, IState<T>>, idParams: IdParams): Promise<T> => {
      try {
        const res = await this.service.activate(idParams);
        context.commit('set', res);
        return res;
      } catch (e) {
        applicationInsights.trackException(e, { idParams }, 'module.base', 'activate');
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

    addNewlyCreatedId: (state: IState<T>, item: T) => {
      if (!state.newlyCreatedIds.find((n) => n.id === item.id)) {
        state.newlyCreatedIds.unshift({ id: item.id, createdOn: (new Date()).getTime() });
      }
    },

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
