import {
  EFinancialAmountModes,
  EFinancialAssistanceStatus,
  EFinancialFrequency,
  IFinancialAssistanceTableData,
  IFinancialAssistanceTableRow,
  IFinancialAssistanceTableSubRow,
} from '@/entities/financial-assistance';
import { IOptionItem, IOptionSubItem } from '@/entities/optionItem';
import { IProgram } from '@/entities/program';
import { IStore, IState } from '@/store/store.types';
import { IMultilingual } from '@/types';
import { IStorage } from './storage.types';

const getGetters = (store: IStore<IState>) => ({
  name(language: string): string {
    return store.getters['financialAssistance/name'](language);
  },

  status(): EFinancialAssistanceStatus {
    return store.getters['financialAssistance/status'];
  },

  addingItem(): boolean | number {
    return store.getters['financialAssistance/addingItem'];
  },

  program(): IProgram {
    return store.getters['financialAssistance/program'];
  },

  items(): IFinancialAssistanceTableRow[] {
    return store.getters['financialAssistance/items'];
  },

  subItems(): IFinancialAssistanceTableSubRow[] {
    return store.getters['financialAssistance/subItems'];
  },

  newItem(): IFinancialAssistanceTableRow {
    return store.getters['financialAssistance/newItem'];
  },

  editedItem(): IFinancialAssistanceTableRow {
    return store.getters['financialAssistance/editedItem'];
  },

  editedItemIndex(): number {
    return store.getters['financialAssistance/editedItemIndex'];
  },

  editedSubItemIndex(): number {
    return store.getters['financialAssistance/editedSubItemIndex'];
  },

  newSubItem(): IFinancialAssistanceTableSubRow {
    return store.getters['financialAssistance/newSubItem'];
  },

  dirty(): boolean {
    return store.getters['financialAssistance/dirty'];
  },

  formDirty(): boolean {
    return store.getters['financialAssistance/formDirty'];
  },

  loading(): boolean {
    return store.getters['financialAssistance/loading'];
  },

  isOperating(): boolean {
    return store.getters['financialAssistance/isOperating'];
  },
});

const getMutations = (store: IStore<IState>) => ({
  setId(id: uuid) {
    store.commit('financialAssistance/setId', { id });
  },

  setName(name: string, language: string) {
    store.commit('financialAssistance/setName', { name, language });
  },

  setNameInAllLanguages(name: IMultilingual) {
    store.commit('financialAssistance/setNameInAllLanguages', { name });
  },

  setStatus(status: EFinancialAssistanceStatus) {
    store.commit('financialAssistance/setStatus', { status });
  },

  setAddingItem(addingItem: boolean) {
    store.commit('financialAssistance/setAddingItem', { addingItem });
  },

  setProgram(program: IProgram) {
    store.commit('financialAssistance/setProgram', { program });
  },

  setItems(items: Array<IFinancialAssistanceTableRow>) {
    store.commit('financialAssistance/setItems', { items });
  },

  setItem(item: IFinancialAssistanceTableRow, index: number) {
    store.commit('financialAssistance/setItem', { item, index });
  },

  setItemItem(item: IOptionItem, index: number) {
    store.commit('financialAssistance/setItemItem', { item, index });
  },

  setSubItem(subItem: IFinancialAssistanceTableSubRow, index: number, parentIndex: number) {
    store.commit('financialAssistance/setSubItem', { subItem, index, parentIndex });
  },

  setSubItemSubItem(subItem: IOptionSubItem, index: number, parentIndex: number) {
    store.commit('financialAssistance/setSubItemSubItem', { subItem, index, parentIndex });
  },

  setSubItemMaximum(maximum: number, index: number, parentIndex: number) {
    store.commit('financialAssistance/setSubItemMaximum', { maximum, index, parentIndex });
  },

  setSubItemAmountType(amountType: EFinancialAmountModes, index: number, parentIndex: number) {
    store.commit('financialAssistance/setSubItemAmountType', { amountType, index, parentIndex });
  },

  setSubItemDocumentationRequired(documentationRequired: boolean, index: number, parentIndex: number) {
    store.commit('financialAssistance/setSubItemDocumentationRequired', { documentationRequired, index, parentIndex });
  },

  setSubItemFrequency(frequency: EFinancialFrequency, index: number, parentIndex: number) {
    store.commit('financialAssistance/setSubItemFrequency', { frequency, index, parentIndex });
  },

  setNewItemItem(item: IOptionItem) {
    store.commit('financialAssistance/setNewItemItem', { item });
  },

  setNewSubItem(newSubItem: IFinancialAssistanceTableSubRow) {
    store.commit('financialAssistance/setNewSubItem', { newSubItem });
  },

  setNewSubItemSubItem(subItem: IOptionSubItem) {
    store.commit('financialAssistance/setNewSubItemSubItem', { subItem });
  },

  setNewSubItemMaximum(maximum: number) {
    store.commit('financialAssistance/setNewSubItemMaximum', { maximum });
  },

  setNewSubItemAmountType(amountType: EFinancialAmountModes) {
    store.commit('financialAssistance/setNewSubItemAmountType', { amountType });
  },

  setNewSubItemDocumentationRequired(documentationRequired: boolean) {
    store.commit('financialAssistance/setNewSubItemDocumentationRequired', { documentationRequired });
  },

  setNewSubItemFrequency(frequency: EFinancialFrequency) {
    store.commit('financialAssistance/setNewSubItemFrequency', { frequency });
  },

  addItem(item: IFinancialAssistanceTableRow) {
    store.commit('financialAssistance/addItem', { item });
  },

  addSubItem(subItem: IFinancialAssistanceTableSubRow, index: number) {
    store.commit('financialAssistance/addSubItem', { subItem, index });
  },

  setItemSubItems(index: number, subItems: Array<IFinancialAssistanceTableSubRow>) {
    store.commit('financialAssistance/setItemSubItems', { index, subItems });
  },

  setEditedItem(editedItem: IFinancialAssistanceTableRow) {
    store.commit('financialAssistance/setEditedItem', { editedItem });
  },

  setEditedItemIndex(editedItemIndex: number) {
    store.commit('financialAssistance/setEditedItemIndex', { editedItemIndex });
  },

  setEditedSubItemIndex(editedSubItemIndex: number) {
    store.commit('financialAssistance/setEditedSubItemIndex', { editedSubItemIndex });
  },

  deleteItem(index: number) {
    store.commit('financialAssistance/deleteItem', { index });
  },

  deleteSubItem(index: number, parentIndex: number) {
    store.commit('financialAssistance/deleteSubItem', { index, parentIndex });
  },

  setDirty(dirty: boolean) {
    store.commit('financialAssistance/setDirty', { dirty });
  },

  setFormDirty(formDirty: boolean) {
    store.commit('financialAssistance/setFormDirty', { formDirty });
  },

  setLoading(loading: boolean) {
    store.commit('financialAssistance/setLoading', { loading });
  },

  resetNewItem() {
    store.commit('financialAssistance/resetNewItem');
  },

  resetNewSubItem() {
    store.commit('financialAssistance/resetNewSubItem');
  },

  resetState() {
    store.commit('financialAssistance/resetState');
  },

  cancelOperation() {
    store.commit('financialAssistance/cancelOperation');
  },
});

const getActions = (store: IStore<IState>) => ({
  createFinancialAssistance(table: boolean): Promise<IFinancialAssistanceTableData> {
    return store.dispatch('financialAssistance/createFinancialAssistance', { table });
  },

  fetchActiveCategories() {
    return store.dispatch('financialAssistance/fetchActiveCategories');
  },
});

export const makeStorage = (store: IStore<IState>): IStorage => ({
  getters: getGetters(store),

  mutations: getMutations(store),

  actions: getActions(store),
});
