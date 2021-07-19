import { mockFinancialAssistanceTableEntity, mockCategories } from '@/entities/financial-assistance';
import { IFinancialAssistanceTablesServiceMock } from './financialAssistanceTables.types';

export const mockFinancialAssistanceTablesService = (): IFinancialAssistanceTablesServiceMock => ({
  createFinancialAssistanceTable: jest.fn(() => mockFinancialAssistanceTableEntity()),
  fetchActiveCategories: jest.fn(() => mockCategories()),
});
