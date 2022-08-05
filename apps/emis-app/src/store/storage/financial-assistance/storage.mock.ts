import {
  IFinancialAssistanceTableCombined,
  IFinancialAssistanceTableEntity,
  mockCategories,
  mockCombinedFinancialAssistances,
  mockFinancialAssistanceTableEntity,
  mockItems,
} from '@libs/entities-lib/financial-assistance';
import { mockProgramEntity } from '@libs/entities-lib/program';
import { Status } from '@libs/entities-lib/base';
import { BaseMock } from '../base/base.mock';
import { IActionsMock, IGettersMock, IMutationsMock } from './storage.types';

export class FinancialAssistanceStorageMock extends BaseMock<IFinancialAssistanceTableCombined, IFinancialAssistanceTableEntity> {
  constructor() {
    super(mockCombinedFinancialAssistances(), mockFinancialAssistanceTableEntity());
  }

  protected getters: IGettersMock = {
    ...this.baseGetters,

    name: jest.fn(() => ''),
    program: jest.fn(() => mockProgramEntity()),
    status: jest.fn(() => Status.Active),
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

    setName: jest.fn(),
    setStatus: jest.fn(),
    setAddingItem: jest.fn(),
    setProgram: jest.fn(),
    setItems: jest.fn(),
    setItem: jest.fn(),
    setItemItem: jest.fn(),
    setSubItem: jest.fn(),
    setNewItemItem: jest.fn(),
    setNewSubItem: jest.fn(),
    setNewSubItemSubItem: jest.fn(),
    setNewSubItemMaximum: jest.fn(),
    setNewSubItemAmountType: jest.fn(),
    setNewSubItemDocumentationRequired: jest.fn(),
    setNewSubItemFrequency: jest.fn(),
    addItem: jest.fn(),
    addSubItem: jest.fn(),
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
    createItem: jest.fn(() => mockFinancialAssistanceTableEntity()),
    createSubItem: jest.fn(() => mockFinancialAssistanceTableEntity()),
    editSubItem: jest.fn(() => mockFinancialAssistanceTableEntity()),
    deleteItem: jest.fn(() => mockFinancialAssistanceTableEntity()),
    deleteSubItem: jest.fn(() => mockFinancialAssistanceTableEntity()),
    reloadItems: jest.fn(),
    fetchByProgramId: jest.fn(() => [mockFinancialAssistanceTableEntity()]),
  };

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  });
}
