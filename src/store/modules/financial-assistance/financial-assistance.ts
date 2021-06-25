import {
  ActionContext, ActionTree, Module, Store,
} from 'vuex';
import { IRootState } from '@/store/store.types';
import utils from '@/entities/utils';
import {
  EFinancialAmountModes,
  EFinancialAssistanceStatus,
  EFinancialFrequency,
  IFinancialAssistanceTableRow,
  IFinancialAssistanceTableRowData,
  IFinancialAssistanceTableSubRow,
  IFinancialAssistanceTableData,
  ICreateFinancialAssistanceTableRequest,
} from '@/entities/financial-assistance';
import { IOptionItem, IOptionSubItem } from '@/entities/optionItem';
import { IMultilingual } from '@/types';
import { IProgram } from '@/entities/program';
import { IState } from './financial-assistance.types';

const getDefaultState = (): IState => ({
  id: '',
  name: {
    translation: {
      en: '',
      fr: '',
    },
  },
  status: EFinancialAssistanceStatus.Inactive,
  program: null,
  mainItems: [],
  dirty: false,
  formDirty: false,
  loading: false,
  addingItem: false,
  editedItem: null,
  editedItemIndex: -1,
  editedSubItemIndex: -1,
  newItem: {
    mainCategory: null,
    subRows: [],
  },
  newSubItem: {
    subCategory: null,
    maximumAmount: 0,
    amountType: EFinancialAmountModes.Fixed,
    documentationRequired: false,
    frequency: EFinancialFrequency.OneTime,
  },
});

const moduleState: IState = getDefaultState();

const getters = {
  name: (state: IState) => (language: string) => state.name.translation[language],

  status: (state: IState) => state.status,

  addingItem: (state: IState) => state.addingItem,

  program: (state: IState) => state.program,

  items: (state: IState) => state.mainItems,

  newItem: (state: IState) => state.newItem,

  newSubItem: (state: IState) => state.newSubItem,

  editedItem: (state: IState) => state.editedItem,

  editedItemIndex: (state: IState) => state.editedItemIndex,

  editedSubItemIndex: (state: IState) => state.editedSubItemIndex,

  subItems: (state: IState) => (index: number) => state.mainItems[index].subRows,

  dirty: (state: IState) => state.dirty,

  formDirty: (state: IState) => state.formDirty,

  loading: (state: IState) => state.loading,

  isOperating: (state: IState) => state.addingItem !== false
    || state.editedItem !== null
    || state.newItem?.mainCategory !== null
    || state.newSubItem?.subCategory !== null
    || state.editedItemIndex > -1
    || state.editedSubItemIndex > -1,
};

const mutations = {
  setId: (state: IState, { id }: { id: string }) => {
    state.id = id;
  },

  setName: (state: IState, { name, language }: { name: string; language: string }) => {
    state.name.translation[language] = name;
    state.formDirty = true;
  },

  setNameInAllLanguages: (state: IState, { name }: { name: IMultilingual }) => {
    state.name = name;
    state.formDirty = true;
  },

  setStatus: (state: IState, { status }: { status: EFinancialAssistanceStatus }) => {
    state.status = status;
    state.formDirty = true;
  },

  setAddingItem: (state: IState, { addingItem }: { addingItem: boolean }) => {
    state.addingItem = addingItem;
  },

  setProgram: (state: IState, { program }: { program: IProgram }) => {
    state.program = program;
    state.formDirty = true;
  },

  setItems: (state: IState, { items }: { items: Array<IFinancialAssistanceTableRow> }) => {
    state.mainItems = items;
    state.dirty = true;
  },

  setNewItemItem: (state: IState, { item }: { item: IOptionItem }) => {
    state.newItem.mainCategory = item;
  },

  setNewSubItemSubItem: (state: IState, { subItem }: { subItem: IOptionSubItem }) => {
    state.newSubItem.subCategory = subItem;
  },

  setNewSubItemMaximum: (state: IState, { maximum }: { maximum: number }) => {
    state.newSubItem.maximumAmount = maximum;
  },

  setNewSubItemAmountType: (state: IState, { amountType }: { amountType: EFinancialAmountModes }) => {
    state.newSubItem.amountType = amountType;
  },

  setNewSubItemDocumentationRequired: (state: IState, { documentationRequired }: { documentationRequired: boolean }) => {
    state.newSubItem.documentationRequired = documentationRequired;
  },

  setNewSubItemFrequency: (state: IState, { frequency }: { frequency: EFinancialFrequency }) => {
    state.newSubItem.frequency = frequency;
  },

  setItem: (state: IState, { item, index }: { item: IFinancialAssistanceTableRow; index: number }) => {
    state.mainItems[index] = item;
    state.dirty = true;
  },

  setItemItem: (state: IState, { item, index }: { item: IOptionItem; index: number }) => {
    state.mainItems[index].mainCategory = item;
  },

  setSubItem: (state: IState, { subItem, index, parentIndex }: { subItem: IFinancialAssistanceTableSubRow; index: number; parentIndex: number }) => {
    state.mainItems[parentIndex].subRows[index] = {
      ...subItem,
      maximumAmount: Number(subItem.maximumAmount),
    };
    state.dirty = true;
  },

  setSubItemSubItem: (state: IState, { subItem, index, parentIndex }: { subItem: IOptionItem; index: number; parentIndex: number }) => {
    state.mainItems[parentIndex].subRows[index].subCategory = subItem;
    state.dirty = true;
  },

  setSubItemMaximum: (state: IState, { maximum, index, parentIndex }: { maximum: number; index: number; parentIndex: number }) => {
    state.mainItems[parentIndex].subRows[index].maximumAmount = maximum;
    state.dirty = true;
  },

  setSubItemAmountType: (
    state: IState,
    { amountType, index, parentIndex }: { amountType: EFinancialAmountModes; index: number; parentIndex: number },
  ) => {
    state.mainItems[parentIndex].subRows[index].amountType = amountType;
    state.dirty = true;
  },

  setSubItemDocumentationRequired: (
    state: IState,
    { documentationRequired, index, parentIndex }: { documentationRequired: boolean; index: number; parentIndex: number },
  ) => {
    state.mainItems[parentIndex].subRows[index].documentationRequired = documentationRequired;
    state.dirty = true;
  },

  setSubItemFrequency: (state: IState, { frequency, index, parentIndex }: { frequency: EFinancialFrequency; index: number; parentIndex: number }) => {
    state.mainItems[parentIndex].subRows[index].frequency = frequency;
    state.dirty = true;
  },

  addItem: (state: IState, { item }: { item: IFinancialAssistanceTableRow }) => {
    state.mainItems.push(item);
    state.dirty = true;
  },

  addSubItem: (state: IState, { subItem, index }: { subItem: IFinancialAssistanceTableSubRow; index: number }) => {
    state.mainItems[index].subRows.push({
      ...subItem,
      maximumAmount: Number(subItem.maximumAmount),
    });
    state.dirty = true;
  },

  setItemSubItems: (state: IState, { index, subItems }: { index: number; subItems: Array<IFinancialAssistanceTableSubRow> }) => {
    state.mainItems[index].subRows = subItems;
    state.dirty = true;
  },

  setEditedItem: (state: IState, { editedItem }: { editedItem: IFinancialAssistanceTableRow }) => {
    state.editedItem = editedItem;
  },

  setEditedItemIndex: (state: IState, { editedItemIndex }: { editedItemIndex: number }) => {
    state.editedItemIndex = editedItemIndex;
  },

  setEditedSubItemIndex: (state: IState, { editedSubItemIndex }: { editedSubItemIndex: number }) => {
    state.editedSubItemIndex = editedSubItemIndex;
  },

  deleteItem: (state: IState, { index }: { index: number }) => {
    state.mainItems.splice(index, 1);
    state.dirty = true;
  },

  deleteSubItem: (state: IState, { index, parentIndex }: { index: number; parentIndex: number }) => {
    state.mainItems[parentIndex].subRows.splice(index, 1);
    state.dirty = true;
  },

  setDirty: (state: IState, { dirty }: { dirty: boolean }) => {
    state.dirty = dirty;
  },

  setFormDirty: (state: IState, { formDirty }: { formDirty: boolean }) => {
    state.formDirty = formDirty;
  },

  setLoading: (state: IState, { loading }: { loading: boolean }) => {
    state.loading = loading;
  },

  resetNewItem(state: IState) {
    state.newItem = {
      mainCategory: null,
      subRows: [],
    };
  },

  cancelOperation(state: IState) {
    state.addingItem = false;
    state.editedItem = null;
    state.editedItemIndex = -1;
    state.editedSubItemIndex = -1;
  },

  resetNewSubItem(state: IState) {
    state.newSubItem = {
      subCategory: null,
      maximumAmount: 0,
      amountType: EFinancialAmountModes.Fixed,
      documentationRequired: false,
      frequency: EFinancialFrequency.OneTime,
    };
  },

  resetState(state: IState) {
    state.id = '';
    state.name = {
      translation: {
        en: '',
        fr: '',
      },
    };
    state.status = EFinancialAssistanceStatus.Inactive;
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

const actions = {
  async createFinancialAssistance(
    this: Store<IState>,
    context: ActionContext<IState, IRootState>,
    { table }: { table: boolean },
  ): Promise<IFinancialAssistanceTableData> {
    const rows: IFinancialAssistanceTableRowData[] = context.state.mainItems.map((item) => ({
      mainCategory: {
        optionItemId: item.mainCategory.id,
        specifiedOther: null,
      },
      subRows: item.subRows.map((sub) => ({
        subCategory: sub.subCategory.id === '-1' ? null : {
          optionItemId: sub.subCategory.id,
          specifiedOther: null,
        },
        maximumAmount: sub.maximumAmount,
        amountType: sub.amountType,
        documentationRequired: sub.documentationRequired,
        frequency: sub.frequency,
      })),
    }));

    const payload: ICreateFinancialAssistanceTableRequest = {
      eventId: context.state.program.eventId,
      programId: context.state.program.id,
      name: utils.getFilledMultilingualField(context.state.name),
      rows,
    };

    if (table) {
      const res = await this.$services.financialAssistanceTables.createFinancialAssistanceTable(payload);
      context.commit('setDirty', { dirty: false });
      context.commit('setFormDirty', { formDirty: false });
      return res;
    }
    return null;
  },

  async fetchActiveCategories(this: Store<IState>) {
    return this.$services.financialAssistanceTables.fetchActiveCategories();
  },
};

export const financialAssistance: Module<IState, IRootState> = {
  namespaced: true,
  state: moduleState as IState,
  getters,
  mutations,
  actions: (actions as unknown) as ActionTree<IState, IRootState>,
};
