import { mockFinancialAssistanceTableEntity, mockCategories } from '@/entities/financial-assistance';
import { IFinancialAssistanceTablesServiceMock } from './financialAssistanceTables.types';

export const mockFinancialAssistanceTablesService = (): IFinancialAssistanceTablesServiceMock => ({
  createFinancialAssistanceTable: jest.fn(() => mockFinancialAssistanceTableEntity()),
  editFinancialAssistanceTable: jest.fn(() => mockFinancialAssistanceTableEntity()),
  fetchActiveCategories: jest.fn(() => mockCategories()),
  createItem: jest.fn(() => mockFinancialAssistanceTableEntity()),
  createSubItem: jest.fn(() => mockFinancialAssistanceTableEntity()),
  editSubItem: jest.fn(() => mockFinancialAssistanceTableEntity()),
  deleteItem: jest.fn(() => mockFinancialAssistanceTableEntity()),
  deleteSubItem: jest.fn(() => mockFinancialAssistanceTableEntity()),
});
