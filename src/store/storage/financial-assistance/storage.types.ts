import { IMultilingual } from '@/types';
import {
  EFinancialAmountModes,
  EFinancialFrequency,
  IFinancialAssistanceTableCombined,
  IFinancialAssistanceTableEntity,
  IFinancialAssistanceTableMetadata,
  IFinancialAssistanceTableItem,
  IFinancialAssistanceTableSubItem,
} from '@/entities/financial-assistance';
import { IProgramEntity } from '@/entities/program';
import { IOptionItem, IOptionSubItem } from '@/entities/optionItem';
import { Status } from '@/entities/base';
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
  faCategories(): IOptionItem[];
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
  faCategories: jest.Mock<IOptionItem[]>;
}

export interface IMutations extends IBaseMutations<IFinancialAssistanceTableEntity, IFinancialAssistanceTableMetadata> {
  setId(id: uuid): void;
  setName(name: string, language: string): void;
  setNameInAllLanguages(name: IMultilingual): void;
  setStatus(status: Status): void;
  setAddingItem(addingItem: boolean): void;
  setProgram(program: IProgramEntity): void;
  setItems(items: Array<IFinancialAssistanceTableItem>): void;
  setItem(item: IFinancialAssistanceTableItem, index: number): void;
  setItemItem(item: IOptionItem, index: number): void;
  setSubItem(subItem: IFinancialAssistanceTableSubItem, index: number, parentIndex: number): void;
  setSubItemSubItem(subItem: IOptionSubItem, index: number, parentIndex: number): void;
  setSubItemMaximum(maximum: number, index: number, parentIndex: number): void;
  setSubItemAmountType(amountType: EFinancialAmountModes, index: number, parentIndex: number): void;
  setSubItemDocumentationRequired(documentationRequired: boolean, index: number, parentIndex: number): void;
  setSubItemFrequency(frequency: EFinancialFrequency, index: number, parentIndex: number): void;
  setNewItemItem(item: IOptionItem): void;
  setNewSubItem(newSubItem: IFinancialAssistanceTableSubItem): void;
  setNewSubItemSubItem(subItem: IOptionSubItem): void;
  setNewSubItemMaximum(maximum: number): void;
  setNewSubItemAmountType(amountType: EFinancialAmountModes): void;
  setNewSubItemDocumentationRequired(documentationRequired: boolean): void;
  setNewSubItemFrequency(frequency: EFinancialFrequency): void;
  addItem(item: IFinancialAssistanceTableItem): void;
  addSubItem(subItem: IFinancialAssistanceTableSubItem, index: number): void;
  setItemSubItems(index: number, subItems: Array<IFinancialAssistanceTableSubItem>): void;
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
  setFinancialAssistance(fa: IFinancialAssistanceTableCombined, categories: IOptionItem[]): void;
}

export interface IMutationsMock extends IBaseMutationsMock<IFinancialAssistanceTableEntity, IFinancialAssistanceTableMetadata> {
  setId: jest.Mock<void>;
  setName: jest.Mock<void>;
  setNameInAllLanguages: jest.Mock<void>;
  setStatus: jest.Mock<void>;
  setAddingItem: jest.Mock<void>;
  setProgram: jest.Mock<void>;
  setItems: jest.Mock<void>;
  setItem: jest.Mock<void>;
  setItemItem: jest.Mock<void>;
  setSubItem: jest.Mock<void>;
  setSubItemSubItem: jest.Mock<void>;
  setSubItemMaximum: jest.Mock<void>;
  setSubItemAmountType: jest.Mock<void>;
  setSubItemDocumentationRequired: jest.Mock<void>;
  setSubItemFrequency: jest.Mock<void>;
  setNewItemItem: jest.Mock<void>;
  setNewSubItem: jest.Mock<void>;
  setNewSubItemSubItem: jest.Mock<void>;
  setNewSubItemMaximum: jest.Mock<void>;
  setNewSubItemAmountType: jest.Mock<void>;
  setNewSubItemDocumentationRequired: jest.Mock<void>;
  setNewSubItemFrequency: jest.Mock<void>;
  addItem: jest.Mock<void>;
  addSubItem: jest.Mock<void>;
  setItemSubItems: jest.Mock<void>;
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
