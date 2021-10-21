import { IDomainBaseService, IDomainBaseServiceMock } from '@/services/base';
import { IMassActionEntity, MassActionRunType, MassActionType } from '@/entities/mass-action/massActions.types';
import { IRestResponse } from '@/services/httpClient';
import { EPaymentModalities } from '@/entities/program';

export interface IMassActionFinancialAssistanceCreatePayload {
  name: string;
  description: string;
  eventId: uuid;
  tableId: uuid;
  programId: uuid;
  mainCategoryId: uuid;
  subCategoryId: uuid;
  paymentModality: EPaymentModalities;
  amount: number;
  search: string;
  filter: string;
}

export interface IMassActionExportListPayload {
  filter: string;
  search: string;
}

export interface IMassActionService extends IDomainBaseService<IMassActionEntity, uuid> {
  process(id: uuid, runType: MassActionRunType): Promise<IMassActionEntity>
  update(id: uuid, payload: {name: string; description: string}): Promise<IMassActionEntity>
  getInvalidFile(massActionId: uuid, runId: uuid): Promise<IRestResponse<string>>
  create(urlSuffix: string, payload: unknown): Promise<IMassActionEntity>
  exportList(massActionType: MassActionType, payload: IMassActionExportListPayload): Promise<IRestResponse<string>>
}

export interface IMassActionServiceMock extends IDomainBaseServiceMock<IMassActionEntity>{
  process: jest.Mock<IMassActionEntity>;
  update: jest.Mock<IMassActionEntity>;
  getInvalidFile: jest.Mock<IRestResponse<string>>;
  create: jest.Mock<IMassActionEntity>;
  exportList: jest.Mock<IRestResponse<string>>;
}
