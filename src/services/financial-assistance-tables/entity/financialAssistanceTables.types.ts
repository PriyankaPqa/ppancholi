import { ICreateFinancialAssistanceTableRequest, IFinancialAssistanceTableEntity } from '@/entities/financial-assistance';
import { IOptionItem } from '@/entities/optionItem';
import { IDomainBaseService } from '@/services/base';

export interface IFinancialAssistanceTablesService extends IDomainBaseService<IFinancialAssistanceTableEntity, uuid> {
  createFinancialAssistanceTable(financialAssistance: ICreateFinancialAssistanceTableRequest): Promise<IFinancialAssistanceTableEntity>;
  fetchActiveCategories(): Promise<IOptionItem[]>;
}

export interface IFinancialAssistanceTablesServiceMock {
  createFinancialAssistanceTable: jest.Mock<IFinancialAssistanceTableEntity>;
  fetchActiveCategories: jest.Mock<IOptionItem[]>;
}
