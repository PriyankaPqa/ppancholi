import {
  EFinancialAmountModes,
  EFinancialFrequency,
  IFinancialAssistanceTableCombined,
  IFinancialAssistanceTableEntity,
  IFinancialAssistanceTableMetadata,
  IFinancialAssistanceTableItem,
  IFinancialAssistanceTableSubItem,
} from '@libs/entities-lib/financial-assistance';
import { IProgramEntity } from '@libs/entities-lib/program';
import { IOptionItem, IOptionSubItem } from '@libs/entities-lib/optionItem';
import { Status } from '@libs/entities-lib/base';
import {
  IBaseActions, IBaseActionsMock, IBaseGetters, IBaseGettersMock, IBaseMutations, IBaseMutationsMock,
} from '../base';

export interface IGetters extends IBaseGetters<IFinancialAssistanceTableEntity, IFinancialAssistanceTableMetadata> {
  name(language: string): string;
  status(): Status;
  addingItem(): boolean | number;
  program(): IProgramEntity;
  items(): IFinancialAssistanceTableItem[];
  subItems(): IFinancialAssistanceTableSubItem[];
  newItem(): IFinancialAssistanceTableItem;
  newSubItem(): IFinancialAssistanceTableSubItem;
  editedItem(): IFinancialAssistanceTableItem;
  editedItemIndex(): number;
  editedSubItemIndex(): number;
  dirty(): boolean;
  formDirty(): boolean;
  loading(): boolean;
  isOperating(): boolean;
}

export interface IGettersMock extends IBaseGettersMock<IFinancialAssistanceTableEntity, IFinancialAssistanceTableMetadata> {
  name: jest.Mock<string>;
  status: jest.Mock<Status>;
  addingItem: jest.Mock<void>;
  program: jest.Mock<IProgramEntity>;
  items: jest.Mock<IFinancialAssistanceTableItem[]>;
  subItems: jest.Mock<void>;
  newItem: jest.Mock<IFinancialAssistanceTableItem>;
  newSubItem: jest.Mock<void>;
  editedItem: jest.Mock<void>;
  editedItemIndex: jest.Mock<void>;
  editedSubItemIndex: jest.Mock<void>;
  dirty: jest.Mock<void>;
  formDirty: jest.Mock<void>;
  loading: jest.Mock<void>;
  isOperating: jest.Mock<void>;
}

export interface IMutations extends IBaseMutations<IFinancialAssistanceTableEntity, IFinancialAssistanceTableMetadata> {
  setName(name: string, language: string): void;
  setStatus(status: Status): void;
  setAddingItem(addingItem: boolean): void;
  setProgram(program: IProgramEntity): void;
  setItems(items: Array<IFinancialAssistanceTableItem>): void;
  setItem(item: IFinancialAssistanceTableItem, index: number): void;
  setItemItem(item: IOptionItem, index: number): void;
  setSubItem(subItem: IFinancialAssistanceTableSubItem, index: number, parentIndex: number): void;
  setNewItemItem(item: IOptionItem): void;
  setNewSubItem(newSubItem: IFinancialAssistanceTableSubItem): void;
  setNewSubItemSubItem(subItem: IOptionSubItem): void;
  setNewSubItemMaximum(maximum: number): void;
  setNewSubItemAmountType(amountType: EFinancialAmountModes): void;
  setNewSubItemDocumentationRequired(documentationRequired: boolean): void;
  setNewSubItemFrequency(frequency: EFinancialFrequency): void;
  addItem(item: IFinancialAssistanceTableItem): void;
  addSubItem(subItem: IFinancialAssistanceTableSubItem, index: number): void;
  setEditedItem(editedItem: IFinancialAssistanceTableItem): void;
  setEditedItemIndex(editedItemIndex: number): void;
  setEditedSubItemIndex(editedSubItemIndex: number): void;
  deleteItem(index: number): void;
  deleteSubItem(index: number, parentIndex: number): void;
  setDirty(dirty: boolean): void;
  setFormDirty(formDirty: boolean): void;
  setLoading(loading: boolean): void;
  resetNewItem(): void;
  resetNewSubItem(): void;
  resetState(): void;
  cancelOperation(): void;
  setFinancialAssistance(fa: IFinancialAssistanceTableCombined,
    categories: IOptionItem[],
    program: IProgramEntity,
    removeInactiveItems?: boolean): void;
}

export interface IMutationsMock extends IBaseMutationsMock<IFinancialAssistanceTableEntity, IFinancialAssistanceTableMetadata> {
  setName: jest.Mock<void>;
  setStatus: jest.Mock<void>;
  setAddingItem: jest.Mock<void>;
  setProgram: jest.Mock<void>;
  setItems: jest.Mock<void>;
  setItem: jest.Mock<void>;
  setItemItem: jest.Mock<void>;
  setSubItem: jest.Mock<void>;
  setNewItemItem: jest.Mock<void>;
  setNewSubItem: jest.Mock<void>;
  setNewSubItemSubItem: jest.Mock<void>;
  setNewSubItemMaximum: jest.Mock<void>;
  setNewSubItemAmountType: jest.Mock<void>;
  setNewSubItemDocumentationRequired: jest.Mock<void>;
  setNewSubItemFrequency: jest.Mock<void>;
  addItem: jest.Mock<void>;
  addSubItem: jest.Mock<void>;
  setEditedItem: jest.Mock<void>;
  setEditedItemIndex: jest.Mock<void>;
  setEditedSubItemIndex: jest.Mock<void>;
  deleteItem: jest.Mock<void>;
  deleteSubItem: jest.Mock<void>;
  setDirty: jest.Mock<void>;
  setFormDirty: jest.Mock<void>;
  setLoading: jest.Mock<void>;
  resetNewItem: jest.Mock<void>;
  resetNewSubItem: jest.Mock<void>;
  resetState: jest.Mock<void>;
  cancelOperation: jest.Mock<void>;
  setFinancialAssistance: jest.Mock<void>;
}

export interface IActions extends IBaseActions<IFinancialAssistanceTableEntity, IFinancialAssistanceTableMetadata, uuid> {
  createFinancialAssistance(table: boolean): Promise<IFinancialAssistanceTableEntity>;
  editFinancialAssistance(): Promise<IFinancialAssistanceTableEntity>;
  createItem(item: IFinancialAssistanceTableItem): Promise<IFinancialAssistanceTableEntity>;
  createSubItem(itemIndex: number, subItem: IFinancialAssistanceTableSubItem): Promise<IFinancialAssistanceTableEntity>;
  editSubItem(itemIndex: number, subItemIndex: number, subItem: IFinancialAssistanceTableSubItem): Promise<IFinancialAssistanceTableEntity>;
  deleteItem(itemIndex: number): Promise<IFinancialAssistanceTableEntity>;
  deleteSubItem(itemIndex: number, subItemIndex: number): Promise<IFinancialAssistanceTableEntity>;
  reloadItems(categories: IOptionItem[]): Promise<void>;
  fetchByProgramId(programId: uuid): Promise<IFinancialAssistanceTableEntity[]>;
}

export interface IActionsMock extends IBaseActionsMock<IFinancialAssistanceTableEntity, IFinancialAssistanceTableMetadata> {
  createFinancialAssistance: jest.Mock<IFinancialAssistanceTableEntity>;
  editFinancialAssistance: jest.Mock<IFinancialAssistanceTableEntity>;
  createItem: jest.Mock<IFinancialAssistanceTableEntity>;
  createSubItem: jest.Mock<IFinancialAssistanceTableEntity>;
  editSubItem: jest.Mock<IFinancialAssistanceTableEntity>;
  deleteItem: jest.Mock<IFinancialAssistanceTableEntity>;
  deleteSubItem: jest.Mock<IFinancialAssistanceTableEntity>;
  reloadItems: jest.Mock<IFinancialAssistanceTableEntity>;
  fetchByProgramId: jest.Mock<IFinancialAssistanceTableEntity[]>;
}

export interface IStorageMake {
  getters: IGetters;
  actions: IActions;
  mutations: IMutations;
}

export interface IStorageMakeMock {
  getters: IGettersMock;
  actions: IActionsMock;
  mutations: IMutationsMock;
}

export interface IStorage {
  make(): IStorageMake;
}

export interface IStorageMock {
  make(): IStorageMake;
}
