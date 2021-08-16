import { mockFinancialAssistanceTableEntity } from '@/entities/financial-assistance';
import { mockDomainBaseService } from '@/services/base/base.mock';
import { IFinancialAssistanceTablesServiceMock } from './financialAssistanceTables.types';

export const mockFinancialAssistanceTablesService = (): IFinancialAssistanceTablesServiceMock => ({
  ...mockDomainBaseService([mockFinancialAssistanceTableEntity()]),

  createFinancialAssistanceTable: jest.fn(() => mockFinancialAssistanceTableEntity()),
  editFinancialAssistanceTable: jest.fn(() => mockFinancialAssistanceTableEntity()),
  createItem: jest.fn(() => mockFinancialAssistanceTableEntity()),
  createSubItem: jest.fn(() => mockFinancialAssistanceTableEntity()),
  editSubItem: jest.fn(() => mockFinancialAssistanceTableEntity()),
  deleteItem: jest.fn(() => mockFinancialAssistanceTableEntity()),
  deleteSubItem: jest.fn(() => mockFinancialAssistanceTableEntity()),
});
