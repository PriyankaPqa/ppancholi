import { mockFinancialAssistanceTableData, mockCategories } from '@/entities/financial-assistance';
import { IFinancialAssistanceTablesServiceMock } from './financialAssistanceTables.types';

export const mockFinancialAssistanceTablesService = (): IFinancialAssistanceTablesServiceMock => ({
  createFinancialAssistanceTable: jest.fn(() => mockFinancialAssistanceTableData()),
  fetchActiveCategories: jest.fn(() => mockCategories()),
});
