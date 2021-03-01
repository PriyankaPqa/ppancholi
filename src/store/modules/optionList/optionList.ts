import {
  Store, Module, ActionContext, ActionTree,
} from 'vuex';
import _sortBy from 'lodash/sortBy';
import _findIndex from 'lodash/findIndex';
import { IRootState } from '@/store/store.types';
import {
  EOptionListItemStatus, EOptionLists, IMultilingual, IOptionListItem,
} from '@/types';
import { IOptionItemData } from '@/entities/optionItem';
import {
  IState,
} from './optionList.types';

const getDefaultState = (): IState => ({
  items: [],
  list: null,
});

const moduleState: IState = getDefaultState();

const getters = {
  items: (state: IState) => _sortBy(state.items, 'orderRank'),
};

const mutations = {
  setItems(state: IState, payload: IOptionListItem[]) {
    state.items = payload;
  },

  setList(state: IState, payload: EOptionLists) {
    state.list = payload;
  },

  addOrUpdateItem(state: IState, payload: IOptionListItem) {
    const index = _findIndex(state.items, { id: payload.id });

    if (index > -1) {
      state.items = [
        ...state.items.slice(0, index),
        payload,
        ...state.items.slice(index + 1),
      ];
    } else {
      state.items.push(payload);
    }
  },

  resetState(state: IState) {
    state.items = [];
    state.list = null;
  },
};

const actions = {
  async fetchItems(this: Store<IState>, context: ActionContext<IState, IState>): Promise<IOptionListItem[]> {
    if (!context.state.list) {
      throw new Error('You must set a value for list');
    }

    const { list } = context.state;
    const data = await this.$services.optionItems.getOptionList(list);

    context.commit('setItems', data);
    return context.getters.items;
  },

  async createOption(this: Store<IState>, context: ActionContext<IState, IState>, payload: IOptionItemData): Promise<IOptionListItem> {
    if (!context.state.list) {
      throw new Error('You must set a value for list');
    }

    const { list } = context.state;
    const data = await this.$services.optionItems.createOptionItem(list, payload);

    if (data != null) context.commit('addOrUpdateItem', data);

    return null;
  },

  async updateName(this: Store<IState>,
    context: ActionContext<IState, IState>,
    payload: { id: string, name: IMultilingual }): Promise<IOptionListItem> {
    if (!context.state.list) {
      throw new Error('You must set a value for list');
    }

    const { list } = context.state;
    const data = await this.$services.optionItems.updateOptionItemName(list, payload.id, payload.name);

    if (data != null) context.commit('addOrUpdateItem', data);

    return null;
  },

  async updateStatus(
    this: Store<IState>,
    context: ActionContext<IState, IState>,
    payload: { id: string, itemStatus: EOptionListItemStatus },
  ): Promise<IOptionListItem> {
    if (!context.state.list) {
      throw new Error('You must set a value for list');
    }

    const { list } = context.state;
    const data = await this.$services.optionItems.updateOptionItemStatus(list, payload.id, payload.itemStatus);

    if (data != null) context.commit('addOrUpdateItem', data);

    return null;
  },

  async updateOrderRanks(
    this: Store<IState>,
    context: ActionContext<IState, IState>,
    payload: Array<IOptionListItem>,
  ): Promise<IOptionListItem[]> {
    if (!context.state.list) {
      throw new Error('You must set a value for list');
    }

    const originalOrder = [...context.state.items];

    context.commit('setItems', payload.map((i, index) => ({
      ...i,
      orderRank: index + 1,
    })));

    const orderRanks: Record<string, number> = {};

    payload.forEach((i, index) => {
      orderRanks[i.id] = index + 1;
    });

    try {
      const { list } = context.state;
      const data = await this.$services.optionItems.updateOptionItemOrderRanks(list, orderRanks);
      return data;
    } catch (e) {
      context.commit('setItems', originalOrder);
      throw e;
    }
  },

  async setIsOther(
    this: Store<IState>,
    context: ActionContext<IState, IState>,
    payload: { id: string, isOther: boolean },
  ): Promise<IOptionListItem> {
    if (!context.state.list) {
      throw new Error('You must set a value for list');
    }

    const { list } = context.state;
    const data = await this.$services.optionItems.setOptionItemIsOther(list, payload.id, payload.isOther);

    if (data != null) {
      // Unset the isOther value from all the items
      context.commit('setItems', context.state.items.map((i) => ({
        ...i,
        isOther: false,
      })));
      // Update the modified item in the state
      context.commit('addOrUpdateItem', data);
      return data;
    }

    return null;
  },

  async setIsDefault(
    this: Store<IState>,
    context: ActionContext<IState, IState>,
    payload: { id: string, isDefault: boolean },
  ): Promise<IOptionListItem> {
    if (!context.state.list) {
      throw new Error('You must set a value for list');
    }

    const { list } = context.state;
    const data = await this.$services.optionItems.setOptionItemIsDefault(list, payload.id, payload.isDefault);

    if (data != null) {
      // Unset the isDefault value from all the items
      context.commit('setItems', context.state.items.map((i) => ({
        ...i,
        isDefault: false,
      })));
      // Update the modified item in the state
      context.commit('addOrUpdateItem', data);
      return data;
    }

    return null;
  },
};

export const optionList: Module<IState, IRootState> = {
  namespaced: true,
  state: moduleState as IState,
  getters,
  mutations,
  actions: actions as unknown as ActionTree<IState, IRootState>,
};
