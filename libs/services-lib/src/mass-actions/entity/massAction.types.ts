import {
  IMassActionEntity, MassActionRunType, MassActionType, MassActionDataCorrectionType,
} from '@libs/entities-lib/mass-action/massActions.types';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { IMultilingual } from '@libs/shared-lib/src/types';
import { IRestResponse } from '../../http-client';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

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

export interface IMassActionAssessmentCreatePayload {
  name: string;
  description: string;
  eventId: uuid;
  assessmentFormId: uuid;
  emailAdditionalDescription: IMultilingual;
  search: string;
  filter: string;
}

export interface IMassActionExportListPayload {
  filter: string;
  search: string;
  language: string;
}

export interface IMassActionFundingRequestCreatePayload {
  name: string;
  description: string;
}

export interface IMassActionService extends IDomainBaseService<IMassActionEntity, uuid> {
  process(id: uuid, runType: MassActionRunType): Promise<IMassActionEntity>
  update(id: uuid, payload: { name: string; description: string }): Promise<IMassActionEntity>
  getInvalidFile({ massActionId, runId, language }: { massActionId: uuid; runId: uuid; language: string }): Promise<IRestResponse<string>>
  create(urlSuffix: string, payload: unknown): Promise<IMassActionEntity>
  exportList(massActionType: MassActionType, payload: IMassActionExportListPayload): Promise<IRestResponse<string>>
  getValidFile({ massActionId, runId, language }: { massActionId: uuid; runId: uuid; language: string }): Promise<IRestResponse<string>>
  downloadTemplate(massActionDataCorrectionType: MassActionType | MassActionDataCorrectionType): Promise<IRestResponse<BlobPart>>
}

export interface IMassActionServiceMock extends IDomainBaseServiceMock<IMassActionEntity> {
  process: jest.Mock<IMassActionEntity>;
  update: jest.Mock<IMassActionEntity>;
  getInvalidFile: jest.Mock<IRestResponse<string>>;
  create: jest.Mock<IMassActionEntity>;
  exportList: jest.Mock<IRestResponse<string>>;
  getValidFile: jest.Mock<IRestResponse<string>>;
  downloadTemplate: jest.Mock<IRestResponse<BlobPart>>;
}
