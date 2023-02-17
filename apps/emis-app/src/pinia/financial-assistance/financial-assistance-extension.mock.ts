import { IFinancialAssistanceTableEntity, mockItems } from '@libs/entities-lib/financial-assistance';

export function getMockFinancialAssistanceExtensionComponents(entity: IFinancialAssistanceTableEntity) {
  return {
    mainItems: mockItems(),
    editedItem: entity.items[0],
    addingItem: false,
    newItem: mockItems()[0],
    isOperating: jest.fn(() => false),
    getName: jest.fn(() => entity.name.translation.en),
    getSubItems: jest.fn(() => entity.items[0].subItems),
    setName: jest.fn(),
    setItemItem: jest.fn(),
    setSubItem: jest.fn(),
    addItem: jest.fn(),
    addSubItem: jest.fn(),
    setDeleteItem: jest.fn(),
    setDeleteSubItem: jest.fn(),
    resetNewItem: jest.fn(),
    cancelOperation: jest.fn(),
    resetNewSubItem: jest.fn(),
    resetExtensionState: jest.fn(),
    setFinancialAssistance: jest.fn(),
    createFinancialAssistance: jest.fn(() => entity),
    editFinancialAssistance: jest.fn(() => entity),
    createItem: jest.fn(() => entity),
    createSubItem: jest.fn(() => entity),
    editSubItem: jest.fn(() => entity),
    deleteSubItem: jest.fn(() => entity),
    deleteItem: jest.fn(() => entity),
    reloadItems: jest.fn(),
    fetchByProgramId: jest.fn(() => entity),
  };
}
