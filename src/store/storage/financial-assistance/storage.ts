import { Status } from '@/entities/base';
import {
  EFinancialAmountModes,
  EFinancialFrequency,
  IFinancialAssistanceTableEntity,
  IFinancialAssistanceTableMetadata,
  IFinancialAssistanceTableRow,
  IFinancialAssistanceTableSubRow,
} from '@/entities/financial-assistance';
import { IOptionItem, IOptionSubItem } from '@/entities/optionItem';
import { IProgram } from '@/entities/program';
import { IStore, IState } from '@/store/store.types';
import { IMultilingual } from '@/types';
import { Base } from '../base';
import { IStorage } from './storage.types';

export class FinancialAssistanceStorage extends Base<IFinancialAssistanceTableEntity, IFinancialAssistanceTableMetadata> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    super(pStore, pEntityModuleName, pMetadataModuleName);
  }

  private getters = {
    ...this.baseGetters,

    name: (language: string): string => this.store.getters[`${this.entityModuleName}/name`](language),

    status: (): Status => this.store.getters[`${this.entityModuleName}/status`],

    addingItem: (): boolean | number => this.store.getters[`${this.entityModuleName}/addingItem`],

    program: (): IProgram => this.store.getters[`${this.entityModuleName}/program`],

    items: (): IFinancialAssistanceTableRow[] => this.store.getters[`${this.entityModuleName}/items`],

    subItems: (): IFinancialAssistanceTableSubRow[] => this.store.getters[`${this.entityModuleName}/subItems`],

    newItem: (): IFinancialAssistanceTableRow => this.store.getters[`${this.entityModuleName}/newItem`],

    editedItem: (): IFinancialAssistanceTableRow => this.store.getters[`${this.entityModuleName}/editedItem`],

    editedItemIndex: (): number => this.store.getters[`${this.entityModuleName}/editedItemIndex`],

    editedSubItemIndex: (): number => this.store.getters[`${this.entityModuleName}/editedSubItemIndex`],

    newSubItem: (): IFinancialAssistanceTableSubRow => this.store.getters[`${this.entityModuleName}/newSubItem`],

    dirty: (): boolean => this.store.getters[`${this.entityModuleName}/dirty`],

    formDirty: (): boolean => this.store.getters[`${this.entityModuleName}/formDirty`],

    loading: (): boolean => this.store.getters[`${this.entityModuleName}/loading`],

    isOperating: (): boolean => this.store.getters[`${this.entityModuleName}/isOperating`],
  };

  private mutations = {
    ...this.baseMutations,

    setId: (id: uuid) => this.store.commit(`${this.entityModuleName}/setId`, { id }),

    setName: (name: string, language: string) => this.store.commit(`${this.entityModuleName}/setName`, { name, language }),

    setNameInAllLanguages: (name: IMultilingual) => this.store.commit(`${this.entityModuleName}/setNameInAllLanguages`, { name }),

    setStatus: (status: Status) => this.store.commit(`${this.entityModuleName}/setStatus`, { status }),

    setAddingItem: (addingItem: boolean) => this.store.commit(`${this.entityModuleName}/setAddingItem`, { addingItem }),

    setProgram: (program: IProgram) => this.store.commit(`${this.entityModuleName}/setProgram`, { program }),

    setItems: (items: Array<IFinancialAssistanceTableRow>) => this.store.commit(`${this.entityModuleName}/setItems`, { items }),

    setItem: (item: IFinancialAssistanceTableRow, index: number) => this.store.commit(`${this.entityModuleName}/setItem`, { item, index }),

    setItemItem: (item: IOptionItem, index: number) => this.store.commit(`${this.entityModuleName}/setItemItem`, { item, index }),

    setSubItem: (
      subItem: IFinancialAssistanceTableSubRow,
      index: number, parentIndex: number,
    ) => this.store.commit(`${this.entityModuleName}/setSubItem`, { subItem, index, parentIndex }),

    setSubItemSubItem: (
      subItem: IOptionSubItem,
      index: number, parentIndex: number,
    ) => this.store.commit(`${this.entityModuleName}/setSubItemSubItem`, { subItem, index, parentIndex }),

    setSubItemMaximum: (
      maximum: number,
      index: number, parentIndex: number,
    ) => this.store.commit(`${this.entityModuleName}/setSubItemMaximum`, { maximum, index, parentIndex }),

    setSubItemAmountType: (
      amountType: EFinancialAmountModes,
      index: number, parentIndex: number,
    ) => this.store.commit(`${this.entityModuleName}/setSubItemAmountType`, { amountType, index, parentIndex }),

    setSubItemDocumentationRequired: (
      documentationRequired: boolean,
      index: number, parentIndex: number,
    ) => this.store.commit(`${this.entityModuleName}/setSubItemDocumentationRequired`, { documentationRequired, index, parentIndex }),

    setSubItemFrequency: (
      frequency: EFinancialFrequency,
      index: number, parentIndex: number,
    ) => this.store.commit(`${this.entityModuleName}/setSubItemFrequency`, { frequency, index, parentIndex }),

    setNewItemItem: (item: IOptionItem) => this.store.commit(`${this.entityModuleName}/setNewItemItem`, { item }),

    setNewSubItem: (newSubItem: IFinancialAssistanceTableSubRow) => this.store.commit(`${this.entityModuleName}/setNewSubItem`, { newSubItem }),

    setNewSubItemSubItem: (subItem: IOptionSubItem) => this.store.commit(`${this.entityModuleName}/setNewSubItemSubItem`, { subItem }),

    setNewSubItemMaximum: (maximum: number) => this.store.commit(`${this.entityModuleName}/setNewSubItemMaximum`, { maximum }),

    setNewSubItemAmountType: (
      amountType: EFinancialAmountModes,
    ) => this.store.commit(`${this.entityModuleName}/setNewSubItemAmountType`, { amountType }),

    setNewSubItemDocumentationRequired: (
      documentationRequired: boolean,
    ) => this.store.commit(`${this.entityModuleName}/setNewSubItemDocumentationRequired`, { documentationRequired }),

    setNewSubItemFrequency: (frequency: EFinancialFrequency) => this.store.commit(`${this.entityModuleName}/setNewSubItemFrequency`, { frequency }),

    addItem: (item: IFinancialAssistanceTableRow) => this.store.commit(`${this.entityModuleName}/addItem`, { item }),

    addSubItem: (
      subItem: IFinancialAssistanceTableSubRow, index: number,
    ) => this.store.commit(`${this.entityModuleName}/addSubItem`, { subItem, index }),

    setItemSubItems: (
      index: number,
      subItems: Array<IFinancialAssistanceTableSubRow>,
    ) => this.store.commit(`${this.entityModuleName}/setItemSubItems`, { index, subItems }),

    setEditedItem: (editedItem: IFinancialAssistanceTableRow) => this.store.commit(`${this.entityModuleName}/setEditedItem`, { editedItem }),

    setEditedItemIndex: (editedItemIndex: number) => this.store.commit(`${this.entityModuleName}/setEditedItemIndex`, { editedItemIndex }),

    setEditedSubItemIndex: (
      editedSubItemIndex: number,
    ) => this.store.commit(`${this.entityModuleName}/setEditedSubItemIndex`, { editedSubItemIndex }),

    deleteItem: (index: number) => this.store.commit(`${this.entityModuleName}/deleteItem`, { index }),

    deleteSubItem: (index: number, parentIndex: number) => this.store.commit(`${this.entityModuleName}/deleteSubItem`, { index, parentIndex }),

    setDirty: (dirty: boolean) => this.store.commit(`${this.entityModuleName}/setDirty`, { dirty }),

    setFormDirty: (formDirty: boolean) => this.store.commit(`${this.entityModuleName}/setFormDirty`, { formDirty }),

    setLoading: (loading: boolean) => this.store.commit(`${this.entityModuleName}/setLoading`, { loading }),

    resetNewItem: () => this.store.commit(`${this.entityModuleName}/resetNewItem`),

    resetNewSubItem: () => this.store.commit(`${this.entityModuleName}/resetNewSubItem`),

    resetState: () => this.store.commit(`${this.entityModuleName}/resetState`),

    cancelOperation: () => this.store.commit(`${this.entityModuleName}/cancelOperation`),
  };

  private actions = {
    ...this.baseActions,

    createFinancialAssistance: (
      table: boolean,
    ): Promise<IFinancialAssistanceTableEntity> => this.store.dispatch(`${this.entityModuleName}/createFinancialAssistance`, { table }),

    fetchActiveCategories: (): Promise<IOptionItem[]> => this.store.dispatch(`${this.entityModuleName}/fetchActiveCategories`),
  };

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  });
}
