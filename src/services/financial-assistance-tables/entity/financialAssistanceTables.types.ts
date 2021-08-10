import {
  ICreateFinancialAssistanceTableRequest,
  IEditFinancialAssistanceTableRequest,
  IFinancialAssistanceTableEntity,
  IFinancialAssistanceTableItemData,
  IFinancialAssistanceTableSubItemData,
} from '@/entities/financial-assistance';
import { IOptionItem } from '@/entities/optionItem';
import { IDomainBaseService } from '@/services/base';

export interface IFinancialAssistanceTablesService extends IDomainBaseService<IFinancialAssistanceTableEntity, uuid> {
  createFinancialAssistanceTable(financialAssistance: ICreateFinancialAssistanceTableRequest): Promise<IFinancialAssistanceTableEntity>;
  editFinancialAssistanceTable(faId: uuid, financialAssistance: IEditFinancialAssistanceTableRequest): Promise<IFinancialAssistanceTableEntity>;
  fetchActiveCategories(): Promise<IOptionItem[]>;
  createItem(faId: uuid, item: IFinancialAssistanceTableItemData): Promise<IFinancialAssistanceTableEntity>;
  createSubItem(faId: uuid, itemId: uuid, subItem: IFinancialAssistanceTableSubItemData): Promise<IFinancialAssistanceTableEntity>;
  editSubItem(faId: uuid, itemId: uuid, subItemId: uuid, subItem: IFinancialAssistanceTableSubItemData): Promise<IFinancialAssistanceTableEntity>;
  deleteItem(faId: uuid, itemId: uuid): Promise<IFinancialAssistanceTableEntity>;
  deleteSubItem(faId: uuid, itemId: uuid, subItemId: uuid): Promise<IFinancialAssistanceTableEntity>;
}

export interface IFinancialAssistanceTablesServiceMock {
  createFinancialAssistanceTable: jest.Mock<IFinancialAssistanceTableEntity>;
  editFinancialAssistanceTable: jest.Mock<IFinancialAssistanceTableEntity>;
  fetchActiveCategories: jest.Mock<IOptionItem[]>;
  createItem: jest.Mock<IFinancialAssistanceTableEntity>;
  createSubItem: jest.Mock<IFinancialAssistanceTableEntity>;
  editSubItem: jest.Mock<IFinancialAssistanceTableEntity>;
  deleteItem: jest.Mock<IFinancialAssistanceTableEntity>;
  deleteSubItem: jest.Mock<IFinancialAssistanceTableEntity>;
}
