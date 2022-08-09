import { mockFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { mockDomainBaseService } from '../../base';
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
  fetchByProgramId: jest.fn(() => [mockFinancialAssistanceTableEntity()]),
});
