import {
  ICreateFinancialAssistanceTableRequest,
  IEditFinancialAssistanceTableRequest,
  IFinancialAssistanceTableEntity,
  IFinancialAssistanceTableItemData,
  IFinancialAssistanceTableSubItemData,
} from '@/entities/financial-assistance';
import { IDomainBaseService } from '@libs/core-lib/services/base';

export interface IFinancialAssistanceTablesService extends IDomainBaseService<IFinancialAssistanceTableEntity, uuid> {
  createFinancialAssistanceTable(financialAssistance: ICreateFinancialAssistanceTableRequest): Promise<IFinancialAssistanceTableEntity>;
  editFinancialAssistanceTable(faId: uuid, financialAssistance: IEditFinancialAssistanceTableRequest): Promise<IFinancialAssistanceTableEntity>;
  createItem(faId: uuid, item: IFinancialAssistanceTableItemData): Promise<IFinancialAssistanceTableEntity>;
  createSubItem(faId: uuid, itemId: uuid, subItem: IFinancialAssistanceTableSubItemData): Promise<IFinancialAssistanceTableEntity>;
  editSubItem(faId: uuid, itemId: uuid, subItemId: uuid, subItem: IFinancialAssistanceTableSubItemData): Promise<IFinancialAssistanceTableEntity>;
  deleteItem(faId: uuid, itemId: uuid): Promise<IFinancialAssistanceTableEntity>;
  deleteSubItem(faId: uuid, itemId: uuid, subItemId: uuid): Promise<IFinancialAssistanceTableEntity>;
  fetchByProgramId(programId: uuid): Promise<IFinancialAssistanceTableEntity[]>;
}

export interface IFinancialAssistanceTablesServiceMock {
  createFinancialAssistanceTable: jest.Mock<IFinancialAssistanceTableEntity>;
  editFinancialAssistanceTable: jest.Mock<IFinancialAssistanceTableEntity>;
  createItem: jest.Mock<IFinancialAssistanceTableEntity>;
  createSubItem: jest.Mock<IFinancialAssistanceTableEntity>;
  editSubItem: jest.Mock<IFinancialAssistanceTableEntity>;
  deleteItem: jest.Mock<IFinancialAssistanceTableEntity>;
  deleteSubItem: jest.Mock<IFinancialAssistanceTableEntity>;
  fetchByProgramId: jest.Mock<IFinancialAssistanceTableEntity[]>;
}
