import {
  EFinancialAmountModes,
  EFinancialFrequency,
  IFinancialAssistanceTableCombined,
  IFinancialAssistanceTableEntity,
  IFinancialAssistanceTableMetadata,
  IFinancialAssistanceTableItem,
  IFinancialAssistanceTableSubItem,
} from '@libs/entities-lib/financial-assistance';
import { IOptionItem, IOptionSubItem } from '@libs/entities-lib/optionItem';
import { IProgramEntity } from '@libs/entities-lib/program';
import { IStore, IState } from '@/store/store.types';
import { Status } from '@libs/entities-lib/base';
import { Base } from '../base';
import { IStorage } from './storage.types';

export class FinancialAssistanceStorage extends Base<IFinancialAssistanceTableEntity, IFinancialAssistanceTableMetadata, uuid> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    super(pStore, pEntityModuleName, pMetadataModuleName);
  }

  private getters = {
    ...this.baseGetters,

    name: (language: string): string => this.store.getters[`${this.entityModuleName}/name`](language),

    status: (): Status => this.store.getters[`${this.entityModuleName}/status`],

    addingItem: (): boolean | number => this.store.getters[`${this.entityModuleName}/addingItem`],

    program: (): IProgramEntity => this.store.getters[`${this.entityModuleName}/program`],

    items: (): IFinancialAssistanceTableItem[] => this.store.getters[`${this.entityModuleName}/items`],

    subItems: (): IFinancialAssistanceTableSubItem[] => this.store.getters[`${this.entityModuleName}/subItems`],

    newItem: (): IFinancialAssistanceTableItem => this.store.getters[`${this.entityModuleName}/newItem`],

    editedItem: (): IFinancialAssistanceTableItem => this.store.getters[`${this.entityModuleName}/editedItem`],

    editedItemIndex: (): number => this.store.getters[`${this.entityModuleName}/editedItemIndex`],

    editedSubItemIndex: (): number => this.store.getters[`${this.entityModuleName}/editedSubItemIndex`],

    newSubItem: (): IFinancialAssistanceTableSubItem => this.store.getters[`${this.entityModuleName}/newSubItem`],

    dirty: (): boolean => this.store.getters[`${this.entityModuleName}/dirty`],

    formDirty: (): boolean => this.store.getters[`${this.entityModuleName}/formDirty`],

    loading: (): boolean => this.store.getters[`${this.entityModuleName}/loading`],

    isOperating: (): boolean => this.store.getters[`${this.entityModuleName}/isOperating`],

    faCategories: (): IOptionItem[] => this.store.getters[`${this.entityModuleName}/faCategories`],
  };

  private mutations = {
    ...this.baseMutations,

    setName: (name: string, language: string) => this.store.commit(`${this.entityModuleName}/setName`, { name, language }),

    setStatus: (status: Status) => this.store.commit(`${this.entityModuleName}/setStatus`, { status }),

    setAddingItem: (addingItem: boolean) => this.store.commit(`${this.entityModuleName}/setAddingItem`, { addingItem }),

    setProgram: (program: IProgramEntity) => this.store.commit(`${this.entityModuleName}/setProgram`, { program }),

    setItems: (items: Array<IFinancialAssistanceTableItem>) => this.store.commit(`${this.entityModuleName}/setItems`, { items }),

    setItem: (item: IFinancialAssistanceTableItem, index: number) => this.store.commit(`${this.entityModuleName}/setItem`, { item, index }),

    setItemItem: (item: IOptionItem, index: number) => this.store.commit(`${this.entityModuleName}/setItemItem`, { item, index }),

    setSubItem: (
      subItem: IFinancialAssistanceTableSubItem,
      index: number,
      parentIndex: number,
    ) => this.store.commit(`${this.entityModuleName}/setSubItem`, { subItem, index, parentIndex }),

    setNewItemItem: (item: IOptionItem) => this.store.commit(`${this.entityModuleName}/setNewItemItem`, { item }),

    setNewSubItem: (newSubItem: IFinancialAssistanceTableSubItem) => this.store.commit(`${this.entityModuleName}/setNewSubItem`, { newSubItem }),

    setNewSubItemSubItem: (subItem: IOptionSubItem) => this.store.commit(`${this.entityModuleName}/setNewSubItemSubItem`, { subItem }),

    setNewSubItemMaximum: (maximum: number) => this.store.commit(`${this.entityModuleName}/setNewSubItemMaximum`, { maximum }),

    setNewSubItemAmountType: (
      amountType: EFinancialAmountModes,
    ) => this.store.commit(`${this.entityModuleName}/setNewSubItemAmountType`, { amountType }),

    setNewSubItemDocumentationRequired: (
      documentationRequired: boolean,
    ) => this.store.commit(`${this.entityModuleName}/setNewSubItemDocumentationRequired`, { documentationRequired }),

    setNewSubItemFrequency: (frequency: EFinancialFrequency) => this.store.commit(`${this.entityModuleName}/setNewSubItemFrequency`, { frequency }),

    addItem: (item: IFinancialAssistanceTableItem) => this.store.commit(`${this.entityModuleName}/addItem`, { item }),

    addSubItem: (subItem: IFinancialAssistanceTableSubItem, index: number) => this.store.commit(`${this.entityModuleName}/addSubItem`, { subItem, index }),

    setEditedItem: (editedItem: IFinancialAssistanceTableItem) => this.store.commit(`${this.entityModuleName}/setEditedItem`, { editedItem }),

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

    setFinancialAssistance: (
      fa: IFinancialAssistanceTableCombined,
      categories: IOptionItem[],
      program: IProgramEntity,
      removeInactiveItems = true,
    ) => this.store.commit(`${this.entityModuleName}/setFinancialAssistance`, {
      fa, categories, program, removeInactiveItems,
    }),
  };

  private actions = {
    ...this.baseActions,
    createFinancialAssistance: (
      table: boolean,
    ): Promise<IFinancialAssistanceTableEntity> => this.store.dispatch(`${this.entityModuleName}/createFinancialAssistance`, { table }),

    createItem: (
      item: IFinancialAssistanceTableItem,
    ): Promise<IFinancialAssistanceTableEntity> => this.store.dispatch(`${this.entityModuleName}/createItem`, { item }),

    createSubItem: (
      itemIndex: number,
      subItem: IFinancialAssistanceTableSubItem,
    ): Promise<IFinancialAssistanceTableEntity> => this.store.dispatch(`${this.entityModuleName}/createSubItem`, { itemIndex, subItem }),

    editSubItem: (
      itemIndex: number,
      subItemIndex: number,
      subItem: IFinancialAssistanceTableSubItem,
    ): Promise<IFinancialAssistanceTableEntity> => this.store.dispatch(`${this.entityModuleName}/editSubItem`, { itemIndex, subItemIndex, subItem }),

    deleteSubItem: (
      itemIndex: number,
      subItemIndex: number,
    ): Promise<IFinancialAssistanceTableEntity> => this.store.dispatch(`${this.entityModuleName}/deleteSubItem`, { itemIndex, subItemIndex }),

    deleteItem: (
      itemIndex: number,
    ): Promise<IFinancialAssistanceTableEntity> => this.store.dispatch(`${this.entityModuleName}/deleteItem`, { itemIndex }),

    editFinancialAssistance: (): Promise<IFinancialAssistanceTableEntity> => this.store.dispatch(`${this.entityModuleName}/editFinancialAssistance`),

    reloadItems: (categories: IOptionItem[]): Promise<void> => this.store.dispatch(`${this.entityModuleName}/reloadItems`, { categories }),

    fetchByProgramId: (
      programId: uuid,
    ): Promise<IFinancialAssistanceTableEntity[]> => this.store.dispatch(`${this.entityModuleName}/fetchByProgramId`, { programId }),
  };

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  });
}
