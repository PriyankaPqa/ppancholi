import { ActionContext, ActionTree } from 'vuex';
import { IRootState } from '@/store/store.types';
import utils from '@/entities/utils';
import { Status } from '@/entities/base';
import {
  EFinancialAmountModes,
  EFinancialFrequency,
  IFinancialAssistanceTableRow,
  IFinancialAssistanceTableRowData,
  IFinancialAssistanceTableSubRow,
  ICreateFinancialAssistanceTableRequest,
  IFinancialAssistanceTableEntity,
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
    mainItems: [] as IFinancialAssistanceTableRow[],
    dirty: false,
    formDirty: false,
    loading: false,
    addingItem: false,
    editedItem: null as IFinancialAssistanceTableRow,
    editedItemIndex: -1,
    editedSubItemIndex: -1,
    newItem: {
      mainCategory: null as IOptionItem,
      subRows: [] as IFinancialAssistanceTableSubRow[],
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

    subItems: (state: IFinancialAssistanceEntityState) => (index: number) => state.mainItems[index].subRows,

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

    setItems: (state: IFinancialAssistanceEntityState, { items }: { items: Array<IFinancialAssistanceTableRow> }) => {
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

    setItem: (state: IFinancialAssistanceEntityState, { item, index }: { item: IFinancialAssistanceTableRow; index: number }) => {
      state.mainItems[index] = item;
      state.dirty = true;
    },

    setItemItem: (state: IFinancialAssistanceEntityState, { item, index }: { item: IOptionItem; index: number }) => {
      state.mainItems[index].mainCategory = item;
    },

    setSubItem: (
      state: IFinancialAssistanceEntityState,
      { subItem, index, parentIndex }: { subItem: IFinancialAssistanceTableSubRow; index: number; parentIndex: number },
    ) => {
      state.mainItems[parentIndex].subRows[index] = {
        ...subItem,
        maximumAmount: Number(subItem.maximumAmount),
      };
      state.dirty = true;
    },

    setSubItemSubItem: (
      state: IFinancialAssistanceEntityState,
      { subItem, index, parentIndex }: { subItem: IOptionSubItem; index: number; parentIndex: number },
    ) => {
      state.mainItems[parentIndex].subRows[index].subCategory = subItem;
      state.dirty = true;
    },

    setSubItemMaximum: (
      state: IFinancialAssistanceEntityState,
      { maximum, index, parentIndex }: { maximum: number; index: number; parentIndex: number },
    ) => {
      state.mainItems[parentIndex].subRows[index].maximumAmount = maximum;
      state.dirty = true;
    },

    setSubItemAmountType: (
      state: IFinancialAssistanceEntityState,
      { amountType, index, parentIndex }: { amountType: EFinancialAmountModes; index: number; parentIndex: number },
    ) => {
      state.mainItems[parentIndex].subRows[index].amountType = amountType;
      state.dirty = true;
    },

    setSubItemDocumentationRequired: (
      state: IFinancialAssistanceEntityState,
      { documentationRequired, index, parentIndex }: { documentationRequired: boolean; index: number; parentIndex: number },
    ) => {
      state.mainItems[parentIndex].subRows[index].documentationRequired = documentationRequired;
      state.dirty = true;
    },

    setSubItemFrequency: (
      state: IFinancialAssistanceEntityState,
      { frequency, index, parentIndex }: { frequency: EFinancialFrequency; index: number; parentIndex: number },
    ) => {
      state.mainItems[parentIndex].subRows[index].frequency = frequency;
      state.dirty = true;
    },

    addItem: (state: IFinancialAssistanceEntityState, { item }: { item: IFinancialAssistanceTableRow }) => {
      state.mainItems.push(item);
      state.dirty = true;
    },

    addSubItem: (state: IFinancialAssistanceEntityState, { subItem, index }: { subItem: IFinancialAssistanceTableSubRow; index: number }) => {
      state.mainItems[index].subRows.push({
        ...subItem,
        maximumAmount: Number(subItem.maximumAmount),
      });
      state.dirty = true;
    },

    setItemSubItems: (
      state: IFinancialAssistanceEntityState,
      { index, subItems }: { index: number; subItems: Array<IFinancialAssistanceTableSubRow> },
    ) => {
      state.mainItems[index].subRows = subItems;
      state.dirty = true;
    },

    setEditedItem: (state: IFinancialAssistanceEntityState, { editedItem }: { editedItem: IFinancialAssistanceTableRow }) => {
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
      state.mainItems[parentIndex].subRows.splice(index, 1);
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
        subRows: [],
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
        subRows: [],
      };
      state.newSubItem = {
        subCategory: null,
        maximumAmount: 0,
        amountType: EFinancialAmountModes.Fixed,
        documentationRequired: false,
        frequency: EFinancialFrequency.OneTime,
      };
    },
  };

  public actions = {
    ...this.baseActions,

    createFinancialAssistance: async (
      context: ActionContext<IFinancialAssistanceEntityState, IFinancialAssistanceEntityState>,
      { table }: { table: boolean },
    ): Promise<IFinancialAssistanceTableEntity> => {
      const rows: IFinancialAssistanceTableRowData[] = context.state.mainItems.map((item) => ({
        mainCategory: {
          optionItemId: item.mainCategory.id,
          specifiedOther: null,
        },
        subRows: item.subRows.map((sub) => ({
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
        })),
      }));

      const payload = {
        status: context.state.status,
        eventId: context.state.program.eventId,
        programId: context.state.program.id,
        name: utils.getFilledMultilingualField(context.state.name),
        rows,
      } as ICreateFinancialAssistanceTableRequest;

      if (table) {
        const res = await this.service.createFinancialAssistanceTable(payload);
        context.commit('setDirty', { dirty: false });
        context.commit('setFormDirty', { formDirty: false });
        return res;
      }
      return null;
    },

    fetchActiveCategories: async (): Promise<IOptionItem[]> => this.service.fetchActiveCategories(),
  };
}
