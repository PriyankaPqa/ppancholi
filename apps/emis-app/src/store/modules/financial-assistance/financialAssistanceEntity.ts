import { ActionContext, ActionTree } from 'vuex';
import { cloneDeep, orderBy } from 'lodash';
import { IRootState } from '@/store/store.types';
import utils from '@libs/entities-lib/utils';
import {
  EFinancialAmountModes,
  EFinancialFrequency,
  IFinancialAssistanceTableItem,
  IFinancialAssistanceTableItemData,
  IFinancialAssistanceTableSubItem,
  ICreateFinancialAssistanceTableRequest,
  IFinancialAssistanceTableEntity,
  IFinancialAssistanceTableCombined,
  IEditFinancialAssistanceTableRequest,
  IFinancialAssistanceTableSubItemData,
} from '@libs/entities-lib/financial-assistance';
import { IOptionItem, IOptionSubItem } from '@libs/entities-lib/optionItem';
import { IProgramEntity } from '@libs/entities-lib/program';
import { FinancialAssistanceTablesService } from '@libs/services-lib/financial-assistance-tables/entity';
import { SignalR } from '@/ui/plugins/signal-r';
import { ISignalRMock } from '@libs/shared-lib/signal-r';
import { Status } from '@libs/entities-lib/base';
import { IFinancialAssistanceEntityState } from './financialAssistanceEntity.types';
import { BaseModule } from '../base';
import { IState } from '../base/base.types';

export class FinancialAssistanceEntityModule extends BaseModule<IFinancialAssistanceTableEntity, uuid> {
  constructor(readonly service: FinancialAssistanceTablesService, protected signalR: typeof SignalR | ISignalRMock) {
    super(service, signalR);
  }

  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
    actions: (this.actions as unknown) as ActionTree<IState<IFinancialAssistanceTableEntity>, IRootState>,
  });

  public state: IFinancialAssistanceEntityState = {
    ...this.baseState,

    id: '',
    name: {
      translation: {
        en: '',
        fr: '',
      },
    },
    status: Status.Inactive,
    program: null as IProgramEntity,
    mainItems: [] as IFinancialAssistanceTableItem[],
    dirty: false,
    formDirty: false,
    loading: false,
    addingItem: false,
    editedItem: null as IFinancialAssistanceTableItem,
    editedItemIndex: -1,
    editedSubItemIndex: -1,
    newItem: {
      mainCategory: null as IOptionItem,
      subItems: [] as IFinancialAssistanceTableSubItem[],
    },
    newSubItem: {
      subCategory: null as IOptionSubItem,
      maximumAmount: 0,
      amountType: EFinancialAmountModes.Fixed,
      documentationRequired: false,
      frequency: EFinancialFrequency.OneTime,
    },
  };

  public getters = {
    ...this.baseGetters,

    name: (state: IFinancialAssistanceEntityState) => (language: string) => state.name.translation[language],

    status: (state: IFinancialAssistanceEntityState) => state.status,

    addingItem: (state: IFinancialAssistanceEntityState) => state.addingItem,

    program: (state: IFinancialAssistanceEntityState) => state.program,

    items: (state: IFinancialAssistanceEntityState) => state.mainItems,

    newItem: (state: IFinancialAssistanceEntityState) => state.newItem,

    newSubItem: (state: IFinancialAssistanceEntityState) => state.newSubItem,

    editedItem: (state: IFinancialAssistanceEntityState) => state.editedItem,

    editedItemIndex: (state: IFinancialAssistanceEntityState) => state.editedItemIndex,

    editedSubItemIndex: (state: IFinancialAssistanceEntityState) => state.editedSubItemIndex,

    subItems: (state: IFinancialAssistanceEntityState) => (index: number) => state.mainItems[index].subItems,

    dirty: (state: IFinancialAssistanceEntityState) => state.dirty,

    formDirty: (state: IFinancialAssistanceEntityState) => state.formDirty,

    loading: (state: IFinancialAssistanceEntityState) => state.loading,

    isOperating: (state: IFinancialAssistanceEntityState) => state.addingItem !== false
      || state.editedItem !== null
      || state.newItem?.mainCategory !== null
      || state.newSubItem?.subCategory !== null
      || state.editedItemIndex > -1
      || state.editedSubItemIndex > -1,
  };

  public mutations = {
    ...this.baseMutations,

    setName: (state: IFinancialAssistanceEntityState, { name, language }: { name: string; language: string }) => {
      state.name.translation[language] = name;
      state.formDirty = true;
    },

    setStatus: (state: IFinancialAssistanceEntityState, { status }: { status: Status }) => {
      state.status = status;
      state.formDirty = true;
    },

    setAddingItem: (state: IFinancialAssistanceEntityState, { addingItem }: { addingItem: boolean }) => {
      state.addingItem = addingItem;
    },

    setProgram: (state: IFinancialAssistanceEntityState, { program }: { program: IProgramEntity }) => {
      state.program = program;
      state.formDirty = true;
    },

    setItems: (state: IFinancialAssistanceEntityState, { items }: { items: Array<IFinancialAssistanceTableItem> }) => {
      state.mainItems = items;
      state.dirty = true;
    },

    setNewItemItem: (state: IFinancialAssistanceEntityState, { item }: { item: IOptionItem }) => {
      state.newItem.mainCategory = item;
    },

    setNewSubItemSubItem: (state: IFinancialAssistanceEntityState, { subItem }: { subItem: IOptionSubItem }) => {
      state.newSubItem.subCategory = subItem;
    },

    setNewSubItemMaximum: (state: IFinancialAssistanceEntityState, { maximum }: { maximum: number }) => {
      state.newSubItem.maximumAmount = maximum;
    },

    setNewSubItemAmountType: (state: IFinancialAssistanceEntityState, { amountType }: { amountType: EFinancialAmountModes }) => {
      state.newSubItem.amountType = amountType;
    },

    setNewSubItemDocumentationRequired: (state: IFinancialAssistanceEntityState, { documentationRequired }: { documentationRequired: boolean }) => {
      state.newSubItem.documentationRequired = documentationRequired;
    },

    setNewSubItemFrequency: (state: IFinancialAssistanceEntityState, { frequency }: { frequency: EFinancialFrequency }) => {
      state.newSubItem.frequency = frequency;
    },

    setItem: (state: IFinancialAssistanceEntityState, { item, index }: { item: IFinancialAssistanceTableItem; index: number }) => {
      state.mainItems[index] = item;
      state.dirty = true;
    },

    setItemItem: (state: IFinancialAssistanceEntityState, { item, index }: { item: IOptionItem; index: number }) => {
      state.mainItems[index].mainCategory = item;
    },

    setSubItem: (
      state: IFinancialAssistanceEntityState,
      { subItem, index, parentIndex }: { subItem: IFinancialAssistanceTableSubItem; index: number; parentIndex: number },
    ) => {
      state.mainItems[parentIndex].subItems[index] = {
        ...subItem,
        maximumAmount: Number(subItem.maximumAmount),
      };
      state.dirty = true;
    },

    addItem: (state: IFinancialAssistanceEntityState, { item }: { item: IFinancialAssistanceTableItem }) => {
      state.mainItems.push(item);
      state.dirty = true;
    },

    addSubItem: (state: IFinancialAssistanceEntityState, { subItem, index }: { subItem: IFinancialAssistanceTableSubItem; index: number }) => {
      state.mainItems[index].subItems.push({
        ...subItem,
        maximumAmount: Number(subItem.maximumAmount),
      });
      state.dirty = true;
    },

    setEditedItem: (state: IFinancialAssistanceEntityState, { editedItem }: { editedItem: IFinancialAssistanceTableItem }) => {
      state.editedItem = editedItem;
    },

    setEditedItemIndex: (state: IFinancialAssistanceEntityState, { editedItemIndex }: { editedItemIndex: number }) => {
      state.editedItemIndex = editedItemIndex;
    },

    setEditedSubItemIndex: (state: IFinancialAssistanceEntityState, { editedSubItemIndex }: { editedSubItemIndex: number }) => {
      state.editedSubItemIndex = editedSubItemIndex;
    },

    deleteItem: (state: IFinancialAssistanceEntityState, { index }: { index: number }) => {
      state.mainItems.splice(index, 1);
      state.dirty = true;
    },

    deleteSubItem: (state: IFinancialAssistanceEntityState, { index, parentIndex }: { index: number; parentIndex: number }) => {
      state.mainItems[parentIndex].subItems.splice(index, 1);
      state.dirty = true;
    },

    setDirty: (state: IFinancialAssistanceEntityState, { dirty }: { dirty: boolean }) => {
      state.dirty = dirty;
    },

    setFormDirty: (state: IFinancialAssistanceEntityState, { formDirty }: { formDirty: boolean }) => {
      state.formDirty = formDirty;
    },

    setLoading: (state: IFinancialAssistanceEntityState, { loading }: { loading: boolean }) => {
      state.loading = loading;
    },

    resetNewItem(state: IFinancialAssistanceEntityState) {
      state.newItem = {
        mainCategory: null,
        subItems: [],
      };
    },

    cancelOperation(state: IFinancialAssistanceEntityState) {
      state.addingItem = false;
      state.editedItem = null;
      state.editedItemIndex = -1;
      state.editedSubItemIndex = -1;
    },

    resetNewSubItem(state: IFinancialAssistanceEntityState) {
      state.newSubItem = {
        subCategory: null,
        maximumAmount: 0,
        amountType: EFinancialAmountModes.Fixed,
        documentationRequired: false,
        frequency: EFinancialFrequency.OneTime,
      };
    },

    resetState(state: IFinancialAssistanceEntityState) {
      state.id = '';
      state.name = {
        translation: {
          en: '',
          fr: '',
        },
      };
      state.status = Status.Inactive;
      state.program = null;
      state.mainItems = [];
      state.dirty = false;
      state.formDirty = false;
      state.loading = false;
      state.addingItem = false;
      state.editedItem = null;
      state.editedItemIndex = -1;
      state.editedSubItemIndex = -1;
      state.newItem = {
        mainCategory: null,
        subItems: [],
      };
      state.newSubItem = {
        subCategory: null,
        maximumAmount: 0,
        amountType: EFinancialAmountModes.Fixed,
        documentationRequired: false,
        frequency: EFinancialFrequency.OneTime,
      };
    },

    setFinancialAssistance: (
      state: IFinancialAssistanceEntityState,
      {
        fa, categories, program, removeInactiveItems,
      }: {
        fa: IFinancialAssistanceTableCombined, categories: IOptionItem[], program: IProgramEntity, removeInactiveItems: boolean,
      },
    ) => {
      state.id = fa.entity.id;
      state.program = program;
      state.name = fa.entity.name;
      state.status = fa.entity.status;

      // when editing an existing payment
      // or showing one that was submitted already, we need to keep inactive items
      const items = this.prepareItemsArray(fa.entity.items, removeInactiveItems);
      state.mainItems = items.map((item) => this.mapItem(item, categories));
    },
  };

  public actions = {
    ...this.baseActions,

    createFinancialAssistance: async (
      context: ActionContext<IFinancialAssistanceEntityState, IFinancialAssistanceEntityState>,
      { table }: { table: boolean },
    ): Promise<IFinancialAssistanceTableEntity> => {
      const items: IFinancialAssistanceTableItemData[] = context.state.mainItems.map(this.itemToItemData);

      const payload = {
        status: context.state.status,
        eventId: context.state.program.eventId,
        programId: context.state.program.id,
        name: utils.getFilledMultilingualField(context.state.name),
        items,
      } as ICreateFinancialAssistanceTableRequest;

      if (table) {
        const res = await this.service.createFinancialAssistanceTable(payload);
        context.commit('setDirty', { dirty: false });
        context.commit('setFormDirty', { formDirty: false });
        if (res) {
          context.commit('addNewlyCreatedId', res);
          context.commit('set', res);
        }
        return res;
      }
      return null;
    },

    editFinancialAssistance: async (
      context: ActionContext<IFinancialAssistanceEntityState, IFinancialAssistanceEntityState>,
    ): Promise<IFinancialAssistanceTableEntity> => {
      const payload = {
        status: context.state.status,
        name: utils.getFilledMultilingualField(context.state.name),
      } as IEditFinancialAssistanceTableRequest;

      const res = await this.service.editFinancialAssistanceTable(context.state.id, payload);
      context.commit('setDirty', { dirty: false });
      context.commit('setFormDirty', { formDirty: false });
      return res;
    },

    createItem: async (
      context: ActionContext<IFinancialAssistanceEntityState, IFinancialAssistanceEntityState>,
      { item }: { item: IFinancialAssistanceTableItem },
    ): Promise<IFinancialAssistanceTableEntity> => {
      const payload = this.itemToItemData(item);

      const res = await this.service.createItem(context.state.id, payload);
      return res;
    },

    createSubItem: async (
      context: ActionContext<IFinancialAssistanceEntityState, IFinancialAssistanceEntityState>,
      { itemIndex, subItem }: { itemIndex: number; subItem: IFinancialAssistanceTableSubItem },
    ): Promise<IFinancialAssistanceTableEntity> => {
      const payload = this.subItemToSubItemData(subItem);
      const itemId = context.state.mainItems[itemIndex].id;

      const res = await this.service.createSubItem(context.state.id, itemId, payload);
      return res;
    },

    editSubItem: async (
      context: ActionContext<IFinancialAssistanceEntityState, IFinancialAssistanceEntityState>,
      { itemIndex, subItemIndex, subItem }: { itemIndex: number; subItemIndex: number; subItem: IFinancialAssistanceTableSubItem },
    ): Promise<IFinancialAssistanceTableEntity> => {
      const payload = this.subItemToSubItemData(subItem);
      const itemId = context.state.mainItems[itemIndex].id;
      const subItemId = context.state.mainItems[itemIndex].subItems[subItemIndex].id;

      const res = await this.service.editSubItem(context.state.id, itemId, subItemId, payload);
      return res;
    },

    deleteSubItem: async (
      context: ActionContext<IFinancialAssistanceEntityState, IFinancialAssistanceEntityState>,
      { itemIndex, subItemIndex }: { itemIndex: number; subItemIndex: number },
    ): Promise<IFinancialAssistanceTableEntity> => {
      const itemId = context.state.mainItems[itemIndex].id;
      const subItemId = context.state.mainItems[itemIndex].subItems[subItemIndex].id;

      const res = await this.service.deleteSubItem(context.state.id, itemId, subItemId);
      return res;
    },

    deleteItem: async (
      context: ActionContext<IFinancialAssistanceEntityState, IFinancialAssistanceEntityState>,
      { itemIndex }: { itemIndex: number },
    ): Promise<IFinancialAssistanceTableEntity> => {
      const itemId = context.state.mainItems[itemIndex].id;

      const res = await this.service.deleteItem(context.state.id, itemId);
      return res;
    },

    reloadItems: async (
      context: ActionContext<IFinancialAssistanceEntityState, IFinancialAssistanceEntityState>,
      { categories }: { categories: IOptionItem[] },
    ): Promise<void> => {
      const res: IFinancialAssistanceTableEntity = await context.dispatch('fetch', { idParams: context.state.id });

      const items = this.prepareItemsArray(res.items, true);

      const itemEntities: IFinancialAssistanceTableItem[] = items.map((item) => this.mapItem(item, categories));

      context.commit('setItems', { items: itemEntities });
    },

    fetchByProgramId: async (
      context: ActionContext<IFinancialAssistanceEntityState, IFinancialAssistanceEntityState>,
      { programId }: { programId: uuid },
    ): Promise<IFinancialAssistanceTableEntity[]> => {
      const res: IFinancialAssistanceTableEntity[] = await this.service.fetchByProgramId(programId);

      return res;
    },
  };

  protected mapItem = (item: IFinancialAssistanceTableItemData, categories: IOptionItem[]): IFinancialAssistanceTableItem => {
    const mainCategory = categories.find((category) => category.id === item.mainCategory.optionItemId);

    return {
      id: item.id,
      status: item.status,
      mainCategory,
      subItems: item.subItems.map((subItem) => ({
        id: subItem.id,
        subCategory: subItem.subCategory
          ? mainCategory?.subitems.find((subitem) => subitem.id === subItem.subCategory.optionItemId)
          : (({
            id: '-1',
            name: {
              translation: {
                en: 'Default',
                fr: 'Défaut',
              },
            },
          } as unknown) as IOptionSubItem),
        maximumAmount: subItem.maximumAmount,
        amountType: subItem.amountType,
        documentationRequired: subItem.documentationRequired,
        frequency: subItem.frequency,
        status: subItem.status,
      })),
    };
  };

  protected itemToItemData = (item: IFinancialAssistanceTableItem): IFinancialAssistanceTableItemData => ({
    id: item.id,
    mainCategory: {
      optionItemId: item.mainCategory.id,
      specifiedOther: null,
    },
    subItems: item.subItems.map(this.subItemToSubItemData),
  });

  protected subItemToSubItemData = (sub: IFinancialAssistanceTableSubItem): IFinancialAssistanceTableSubItemData => ({
    id: sub.id,
    subCategory:
      sub.subCategory.id === '-1'
        ? null
        : {
          optionItemId: sub.subCategory.id,
          specifiedOther: null,
        },
    maximumAmount: sub.maximumAmount,
    amountType: sub.amountType,
    documentationRequired: sub.documentationRequired,
    frequency: sub.frequency,
  });

  // sorts items and subitems, plus can remove inactive items if required
  protected prepareItemsArray(items: IFinancialAssistanceTableItemData[], excludeDeleted: boolean): IFinancialAssistanceTableItemData[] {
    const itemsCopy = cloneDeep(items);

    const results = orderBy(itemsCopy.filter((item) => {
      if (item.status === Status.Inactive && excludeDeleted) {
        return false;
      }

      item.subItems = orderBy(item.subItems.filter((subItem) => subItem.status === Status.Active || !excludeDeleted), 'status');

      return true;
    }), 'status');

    return results;
  }
}
