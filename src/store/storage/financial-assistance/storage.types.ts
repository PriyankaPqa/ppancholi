import { IMultilingual } from '@/types';
import {
  EFinancialAmountModes,
  EFinancialAssistanceStatus,
  EFinancialFrequency,
  IFinancialAssistanceTableData,
  IFinancialAssistanceTableRow,
  IFinancialAssistanceTableSubRow,
} from '@/entities/financial-assistance';
import { IProgram } from '@/entities/program';
import { IOptionItem, IOptionSubItem } from '@/entities/optionItem';

export interface IStorage {
  getters: {
    name(language: string): string;
    status(): EFinancialAssistanceStatus;
    addingItem(): boolean | number
    program(): IProgram;
    items(): IFinancialAssistanceTableRow[];
    subItems(): IFinancialAssistanceTableSubRow[];
    newItem(): IFinancialAssistanceTableRow;
    newSubItem(): IFinancialAssistanceTableSubRow;
    editedItem(): IFinancialAssistanceTableRow;
    editedItemIndex(): number;
    editedSubItemIndex(): number;
    dirty(): boolean;
    formDirty(): boolean;
    loading(): boolean;
    isOperating(): boolean;
  };

  mutations: {
    setId(id: uuid): void;
    setName(name: string, language: string): void;
    setNameInAllLanguages(name: IMultilingual): void;
    setStatus(status: EFinancialAssistanceStatus): void;
    setAddingItem(addingItem: boolean): void;
    setProgram(program: IProgram): void;
    setItems(items: Array<IFinancialAssistanceTableRow>): void;
    setItem(item: IFinancialAssistanceTableRow, index: number): void;
    setItemItem(item: IOptionItem, index: number): void;
    setSubItem(subItem: IFinancialAssistanceTableSubRow, index: number, parentIndex: number): void;
    setSubItemSubItem(subItem: IOptionSubItem, index: number, parentIndex: number): void;
    setSubItemMaximum(maximum: number, index: number, parentIndex: number): void;
    setSubItemAmountType(amountType: EFinancialAmountModes, index: number, parentIndex: number): void;
    setSubItemDocumentationRequired(documentationRequired: boolean, index: number, parentIndex: number): void;
    setSubItemFrequency(frequency: EFinancialFrequency, index: number, parentIndex: number): void;
    setNewItemItem(item: IOptionItem): void;
    setNewSubItem(newSubItem: IFinancialAssistanceTableSubRow): void;
    setNewSubItemSubItem(subItem: IOptionSubItem): void;
    setNewSubItemMaximum(maximum: number): void;
    setNewSubItemAmountType(amountType: EFinancialAmountModes): void;
    setNewSubItemDocumentationRequired(documentationRequired: boolean): void;
    setNewSubItemFrequency(frequency: EFinancialFrequency): void;
    addItem(item: IFinancialAssistanceTableRow): void;
    addSubItem(subItem: IFinancialAssistanceTableSubRow, index: number): void;
    setItemSubItems(index: number, subItems: Array<IFinancialAssistanceTableSubRow>): void;
    setEditedItem(editedItem: IFinancialAssistanceTableRow): void;
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
  };

  actions: {
    createFinancialAssistance(table: boolean): Promise<IFinancialAssistanceTableData>;
    fetchActiveCategories(): Promise<IOptionItem[]>;
  };
}

export interface IStorageMock {
  getters: {
    name: jest.Mock<void>;
    status: jest.Mock<void>;
    addingItem: jest.Mock<void>;
    program: jest.Mock<void>;
    items: jest.Mock<void>;
    subItems: jest.Mock<void>;
    newItem: jest.Mock<void>;
    newSubItem: jest.Mock<void>;
    editedItem: jest.Mock<void>;
    editedItemIndex: jest.Mock<void>;
    editedSubItemIndex: jest.Mock<void>;
    dirty: jest.Mock<void>;
    formDirty: jest.Mock<void>;
    loading: jest.Mock<void>;
    isOperating: jest.Mock<void>;
  };

  mutations: {
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
  };

  actions: {
    createFinancialAssistance: jest.Mock<void>;
    fetchActiveCategories: jest.Mock<void>;
  };
}
