import { ActionContext, ActionTree } from 'vuex';
import { cloneDeep } from 'lodash';
import { IRootState } from '@/store/store.types';
import utils from '@/entities/utils';
import { Status } from '@/entities/base';
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
} from '@/entities/financial-assistance';
import { IOptionItem, IOptionSubItem } from '@/entities/optionItem';
import { IMultilingual } from '@/types';
import { IProgram } from '@/entities/program';
import { FinancialAssistanceTablesService } from '@/services/financial-assistance-tables/entity';
import { IFinancialAssistanceEntityState } from './financialAssistanceEntity.types';
import { BaseModule } from '../base';
import { IState } from '../base/base.types';

export class FinancialAssistanceEntityModule extends BaseModule<IFinancialAssistanceTableEntity, uuid> {
  constructor(readonly service: FinancialAssistanceTablesService) {
    super(service);
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
    program: null as IProgram,
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
    faCategories: [],
  };

  public getters = {
    ...this.baseGetters,

    faCategories: (state: IFinancialAssistanceEntityState) => state.faCategories,

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

    setId: (state: IFinancialAssistanceEntityState, { id }: { id: string }) => {
      state.id = id;
    },

    setName: (state: IFinancialAssistanceEntityState, { name, language }: { name: string; language: string }) => {
      state.name.translation[language] = name;
      state.formDirty = true;
    },

    setNameInAllLanguages: (state: IFinancialAssistanceEntityState, { name }: { name: IMultilingual }) => {
      state.name = name;
      state.formDirty = true;
    },

    setStatus: (state: IFinancialAssistanceEntityState, { status }: { status: Status }) => {
      state.status = status;
      state.formDirty = true;
    },

    setAddingItem: (state: IFinancialAssistanceEntityState, { addingItem }: { addingItem: boolean }) => {
      state.addingItem = addingItem;
    },

    setProgram: (state: IFinancialAssistanceEntityState, { program }: { program: IProgram }) => {
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

    setSubItemSubItem: (
      state: IFinancialAssistanceEntityState,
      { subItem, index, parentIndex }: { subItem: IOptionSubItem; index: number; parentIndex: number },
    ) => {
      state.mainItems[parentIndex].subItems[index].subCategory = subItem;
      state.dirty = true;
    },

    setSubItemMaximum: (
      state: IFinancialAssistanceEntityState,
      { maximum, index, parentIndex }: { maximum: number; index: number; parentIndex: number },
    ) => {
      state.mainItems[parentIndex].subItems[index].maximumAmount = maximum;
      state.dirty = true;
    },

    setSubItemAmountType: (
      state: IFinancialAssistanceEntityState,
      { amountType, index, parentIndex }: { amountType: EFinancialAmountModes; index: number; parentIndex: number },
    ) => {
      state.mainItems[parentIndex].subItems[index].amountType = amountType;
      state.dirty = true;
    },

    setSubItemDocumentationRequired: (
      state: IFinancialAssistanceEntityState,
      { documentationRequired, index, parentIndex }: { documentationRequired: boolean; index: number; parentIndex: number },
    ) => {
      state.mainItems[parentIndex].subItems[index].documentationRequired = documentationRequired;
      state.dirty = true;
    },

    setSubItemFrequency: (
      state: IFinancialAssistanceEntityState,
      { frequency, index, parentIndex }: { frequency: EFinancialFrequency; index: number; parentIndex: number },
    ) => {
      state.mainItems[parentIndex].subItems[index].frequency = frequency;
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

    setItemSubItems: (
      state: IFinancialAssistanceEntityState,
      { index, subItems }: { index: number; subItems: Array<IFinancialAssistanceTableSubItem> },
    ) => {
      state.mainItems[index].subItems = subItems;
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

    setFinancialAssistance: (state: IFinancialAssistanceEntityState, { fa }: { fa: IFinancialAssistanceTableCombined }) => {
      state.id = fa.entity.id;
      state.program = {
        id: fa.metadata.programId,
        name: fa.metadata.programName,
      } as IProgram;
      state.name = fa.entity.name;
      state.status = fa.entity.status;

      const items = this.excludeDeleted(fa.entity.items);

      state.mainItems = items.map((row) => {
        const mainCategory = state.faCategories.find((category) => category.id === row.mainCategory.optionItemId);

        return {
          id: row.id,
          mainCategory,
          subItems: row.subItems.map((subRow) => ({
            id: subRow.id,
            subCategory: mainCategory.subitems.find((subitem) => subitem.id === subRow.subCategory.optionItemId),
            maximumAmount: subRow.maximumAmount,
            amountType: subRow.amountType,
            documentationRequired: subRow.documentationRequired,
            frequency: subRow.frequency,
          })),
        };
      });
    },

    setFaCategories(state: IFinancialAssistanceEntityState, { faCategories }: { faCategories: IOptionItem[] }) {
      state.faCategories = faCategories;
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

    fetchActiveCategories: async (
      context: ActionContext<IFinancialAssistanceEntityState, IFinancialAssistanceEntityState>,
    ): Promise<IOptionItem[]> => {
      const faCategories = await this.service.fetchActiveCategories();

      context.commit('setFaCategories', { faCategories });

      return faCategories;
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
      { itemIndex, subItem }: { itemIndex: number, subItem: IFinancialAssistanceTableSubItem },
    ): Promise<IFinancialAssistanceTableEntity> => {
      const payload = this.subItemToSubItemData(subItem);
      const itemId = context.state.mainItems[itemIndex].id;

      const res = await this.service.createSubItem(context.state.id, itemId, payload);
      return res;
    },

    editSubItem: async (
      context: ActionContext<IFinancialAssistanceEntityState, IFinancialAssistanceEntityState>,
      { itemIndex, subItemIndex, subItem }: { itemIndex: number, subItemIndex: number, subItem: IFinancialAssistanceTableSubItem },
    ): Promise<IFinancialAssistanceTableEntity> => {
      const payload = this.subItemToSubItemData(subItem);
      const itemId = context.state.mainItems[itemIndex].id;
      const subItemId = context.state.mainItems[itemIndex].subItems[subItemIndex].id;

      const res = await this.service.editSubItem(context.state.id, itemId, subItemId, payload);
      return res;
    },

    deleteSubItem: async (
      context: ActionContext<IFinancialAssistanceEntityState, IFinancialAssistanceEntityState>,
      { itemIndex, subItemIndex }: { itemIndex: number, subItemIndex: number },
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
    ): Promise<void> => {
      const res: IFinancialAssistanceTableEntity = await context.dispatch('fetch', { idParams: context.state.id });

      const items = this.excludeDeleted(res.items);

      const itemEntities: IFinancialAssistanceTableItem[] = items.map((row) => {
        const mainCategory = context.state.faCategories.find((category) => category.id === row.mainCategory.optionItemId);

        return {
          id: row.id,
          mainCategory,
          subItems: row.subItems.map((subRow) => ({
            id: subRow.id,
            subCategory: mainCategory.subitems.find((subitem) => subitem.id === subRow.subCategory.optionItemId),
            maximumAmount: subRow.maximumAmount,
            amountType: subRow.amountType,
            documentationRequired: subRow.documentationRequired,
            frequency: subRow.frequency,
          })),
        };
      });

      context.commit('setItems', { items: itemEntities });
    },
  };

  protected itemToItemData = (item: IFinancialAssistanceTableItem): IFinancialAssistanceTableItemData => ({
    id: item.id,
    mainCategory: {
      optionItemId: item.mainCategory.id,
      specifiedOther: null,
    },
    subItems: item.subItems.map(this.subItemToSubItemData),
  })

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
  })

  protected excludeDeleted(items: IFinancialAssistanceTableItemData[]): IFinancialAssistanceTableItemData[] {
    const itemsCopy = cloneDeep(items);

    const results = itemsCopy.filter((item) => {
      if (item.status === Status.Inactive) return false;

      item.subItems = item.subItems.filter((subItem) => subItem.status === Status.Active);

      return true;
    });

    return results;
  }
}
