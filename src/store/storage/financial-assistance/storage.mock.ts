import {
  IFinancialAssistanceTableCombined,
  IFinancialAssistanceTableEntity,
  mockCategories,
  mockCombinedFinancialAssistances,
  mockFinancialAssistanceTableEntity,
  mockItems,
} from '@/entities/financial-assistance';
import { BaseMock } from '../base/base.mock';
import { IActionsMock, IGettersMock, IMutationsMock } from './storage.types';

export class FinancialAssistanceStorageMock extends BaseMock<IFinancialAssistanceTableCombined, IFinancialAssistanceTableEntity> {
  constructor() {
    super(mockCombinedFinancialAssistances(), mockFinancialAssistanceTableEntity());
  }

  protected getters: IGettersMock = {
    ...this.baseGetters,

    name: jest.fn(() => ''),
    program: jest.fn(),
    status: jest.fn(),
    addingItem: jest.fn(),
    items: jest.fn(() => mockItems()),
    subItems: jest.fn(),
    newItem: jest.fn(() => mockItems()[0]),
    editedItem: jest.fn(),
    editedItemIndex: jest.fn(),
    editedSubItemIndex: jest.fn(),
    newSubItem: jest.fn(),
    dirty: jest.fn(),
    formDirty: jest.fn(),
    loading: jest.fn(),
    isOperating: jest.fn(),
    faCategories: jest.fn(() => mockCategories()),
  };

  protected mutations: IMutationsMock = {
    ...this.baseMutations,

    setId: jest.fn(),
    setName: jest.fn(),
    setNameInAllLanguages: jest.fn(),
    setStatus: jest.fn(),
    setAddingItem: jest.fn(),
    setProgram: jest.fn(),
    setItems: jest.fn(),
    setItem: jest.fn(),
    setItemItem: jest.fn(),
    setSubItem: jest.fn(),
    setSubItemSubItem: jest.fn(),
    setSubItemMaximum: jest.fn(),
    setSubItemAmountType: jest.fn(),
    setSubItemDocumentationRequired: jest.fn(),
    setSubItemFrequency: jest.fn(),
    setNewItemItem: jest.fn(),
    setNewSubItem: jest.fn(),
    setNewSubItemSubItem: jest.fn(),
    setNewSubItemMaximum: jest.fn(),
    setNewSubItemAmountType: jest.fn(),
    setNewSubItemDocumentationRequired: jest.fn(),
    setNewSubItemFrequency: jest.fn(),
    addItem: jest.fn(),
    addSubItem: jest.fn(),
    setItemSubItems: jest.fn(),
    setEditedItem: jest.fn(),
    setEditedItemIndex: jest.fn(),
    setEditedSubItemIndex: jest.fn(),
    deleteItem: jest.fn(),
    deleteSubItem: jest.fn(),
    setDirty: jest.fn(),
    setFormDirty: jest.fn(),
    setLoading: jest.fn(),
    resetNewItem: jest.fn(),
    resetNewSubItem: jest.fn(),
    resetState: jest.fn(),
    cancelOperation: jest.fn(),
    setFinancialAssistance: jest.fn(),
  };

  protected actions: IActionsMock = {
    ...this.baseActions,
    createFinancialAssistance: jest.fn(),
    editFinancialAssistance: jest.fn(() => mockFinancialAssistanceTableEntity()),
    fetchActiveCategories: jest.fn(() => mockCategories()),
    createItem: jest.fn(() => mockFinancialAssistanceTableEntity()),
    createSubItem: jest.fn(() => mockFinancialAssistanceTableEntity()),
    editSubItem: jest.fn(() => mockFinancialAssistanceTableEntity()),
    deleteItem: jest.fn(() => mockFinancialAssistanceTableEntity()),
    deleteSubItem: jest.fn(() => mockFinancialAssistanceTableEntity()),
    reloadItems: jest.fn(),
  };

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  });
}
