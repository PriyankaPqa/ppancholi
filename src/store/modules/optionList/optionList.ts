import {
  Store, Module, ActionContext, ActionTree,
} from 'vuex';
import _sortBy from 'lodash/sortBy';
import _findIndex from 'lodash/findIndex';
import helpers from '@/ui/helpers/helpers';
import { IRootState } from '@/store/store.types';
import { IMultilingual } from '@/types';
import {
  IOptionItemData, IOptionItem, OptionItem, EOptionLists, IOptionSubItem,
} from '@/entities/optionItem';
import {
  IState,
} from './optionList.types';

import { Status } from '@/entities/base';

const getDefaultState = (): IState => ({
  items: [],
  list: null,
});

const moduleState: IState = getDefaultState();

const getters = {
  items: (state: IState) => _sortBy(state.items.map((e) => new OptionItem(e)), 'orderRank'),
};

const mutations = {
  setItems(state: IState, payload: IOptionItem[]) {
    state.items = payload;
  },

  setList(state: IState, payload: EOptionLists) {
    state.list = payload;
  },

  addOrUpdateItem(state: IState, payload: IOptionItem) {
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
  async fetchItems(this: Store<IState>, context: ActionContext<IState, IState>): Promise<IOptionItem[]> {
    if (!context.state.list) {
      throw new Error('You must set a value for list');
    }

    const { list } = context.state;
    const data = await this.$services.optionItems.getOptionList(list);

    context.commit('setItems', data);
    return context.getters.items;
  },

  async fetchSubItems(this: Store<IState>, context: ActionContext<IState, IState>): Promise<IOptionSubItem[]> {
    if (!context.state.list) {
      throw new Error('You must set a value for list');
    }
    const { list } = context.state;
    const parentData: IOptionItem[] = await this.$services.optionItems.getOptionList(list);
    let data: IOptionSubItem[] = [];

    if (parentData) {
      parentData.forEach((element) => {
        element.subitems.forEach((subItem) => data.push(subItem));
      });
      data = helpers.sortMultilingualArray(data, 'name', true); // Trim
    }
    return data;
  },

  async createOption(this: Store<IState>, context: ActionContext<IState, IState>, payload: IOptionItemData): Promise<IOptionItem> {
    if (!context.state.list) {
      throw new Error('You must set a value for list');
    }

    const { list } = context.state;
    const data = await this.$services.optionItems.createOptionItem(list, payload);

    if (data != null) context.commit('addOrUpdateItem', data);

    return null;
  },

  async addSubItem(this: Store<IState>, context: ActionContext<IState, IState>,
    payload: { itemId: string, subItem: IOptionSubItem }): Promise<IOptionItem> {
    if (!context.state.list) {
      throw new Error('You must set a value for list');
    }

    const data = await this.$services.optionItems.addSubItem(context.state.list, payload.itemId, payload.subItem);

    if (data != null) context.commit('addOrUpdateItem', data);

    return null;
  },

  async updateItem(this: Store<IState>,
    context: ActionContext<IState, IState>,
    payload: { id: string, name: IMultilingual, description: IMultilingual }): Promise<IOptionItem> {
    if (!context.state.list) {
      throw new Error('You must set a value for list');
    }

    const { list } = context.state;
    const data = await this.$services.optionItems.updateOptionItem(list, payload.id, payload.name, payload.description);

    if (data != null) context.commit('addOrUpdateItem', data);

    return null;
  },

  async updateSubItem(this: Store<IState>,
    context: ActionContext<IState, IState>,
    payload: { itemId: string, subItemId: string, name: IMultilingual, description: IMultilingual }): Promise<IOptionItem> {
    if (!context.state.list) {
      throw new Error('You must set a value for list');
    }

    const { list } = context.state;
    const data = await this.$services.optionItems.updateOptionSubItem(list, payload.itemId, payload.subItemId, payload.name, payload.description);

    if (data != null) context.commit('addOrUpdateItem', data);

    return null;
  },

  async updateStatus(
    this: Store<IState>,
    context: ActionContext<IState, IState>,
    payload: { id: string, status: Status },
  ): Promise<IOptionItem> {
    if (!context.state.list) {
      throw new Error('You must set a value for list');
    }

    const { list } = context.state;
    const data = await this.$services.optionItems.updateOptionItemStatus(list, payload.id, payload.status);

    if (data != null) context.commit('addOrUpdateItem', data);

    return null;
  },

  async updateSubItemStatus(
    this: Store<IState>,
    context: ActionContext<IState, IState>,
    payload: { itemId: string, subItemId: string, status: Status },
  ): Promise<IOptionItem> {
    if (!context.state.list) {
      throw new Error('You must set a value for list');
    }

    const { list } = context.state;
    const data = await this.$services.optionItems.updateOptionSubItemStatus(list, payload.itemId, payload.subItemId, payload.status);

    if (data != null) context.commit('addOrUpdateItem', data);

    return null;
  },

  async updateOrderRanks(
    this: Store<IState>,
    context: ActionContext<IState, IState>,
    payload: Array<IOptionItem>,
  ): Promise<IOptionItem[]> {
    if (!context.state.list) {
      throw new Error('You must set a value for list');
    }
    const orderRanks: Record<string, number> = {};

    const originalOrder = _sortBy([...context.state.items], 'orderRank');

    const newOrderedItems = payload.map((i, index) => {
      const oldItem = originalOrder[index];

      const newRank = oldItem.orderRank;

      return {
        ...i,
        orderRank: newRank,
      };
    });

    context.commit('setItems', newOrderedItems);

    newOrderedItems.forEach((i) => {
      orderRanks[i.id] = i.orderRank;
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

  async updateSubItemOrderRanks(
    this: Store<IState>,
    context: ActionContext<IState, IState>,
    newItem: IOptionItem,
  ): Promise<IOptionItem[]> {
    if (!context.state.list) {
      throw new Error('You must set a value for list');
    }
    const originalItem = context.state.items.find((i) => i.id === newItem.id);

    const updatedItem = {
      ...newItem,
      subitems: newItem.subitems.map((sub, index) => ({
        ...sub,
        orderRank: index + 1,
      })),
    };

    context.commit('addOrUpdateItem', updatedItem);

    const params: Record<string, number> = {};
    updatedItem.subitems.forEach((sub, index) => {
      params[sub.id] = index + 1;
    });

    try {
      const data = await this.$services.optionItems.updateOptionSubItemOrderRanks(context.state.list, newItem.id, params);

      return data;
    } catch (e) {
      context.commit('addOrUpdateItem', originalItem);
      throw e;
    }
  },

  async setIsOther(
    this: Store<IState>,
    context: ActionContext<IState, IState>,
    payload: { id: string, isOther: boolean },
  ): Promise<IOptionItem> {
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
  ): Promise<IOptionItem> {
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
