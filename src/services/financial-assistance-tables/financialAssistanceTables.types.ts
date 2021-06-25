import { ICreateFinancialAssistanceTableRequest, IFinancialAssistanceTableData } from '@/entities/financial-assistance';
import { IOptionItem } from '@/entities/optionItem';

export interface IFinancialAssistanceTablesService {
  createFinancialAssistanceTable(financialAssistance: ICreateFinancialAssistanceTableRequest): Promise<IFinancialAssistanceTableData>;
  fetchActiveCategories(): Promise<IOptionItem[]>;
}

export interface IFinancialAssistanceTablesServiceMock {
  createFinancialAssistanceTable: jest.Mock<IFinancialAssistanceTableData>;
  fetchActiveCategories: jest.Mock<IOptionItem[]>;
}
