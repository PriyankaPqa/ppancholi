import {
  IMassActionEntity, MassActionRunType, MassActionType, MassActionDataCorrectionType, MassActionCommunicationMethod,
} from '@libs/entities-lib/mass-action/massActions.types';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { IListOption, IMultilingual } from '@libs/shared-lib/src/types';
import { CaseFileStatus } from '@libs/entities-lib/src/case-file';
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
  emailSubject: IMultilingual;
  emailTopCustomContent: IMultilingual;
  emailAdditionalDescription: IMultilingual;
  search: string;
  filter: string;
}

export interface IMassActionCommunicationCreatePayload {
  name: string;
  description: string;
  eventId: uuid;
  method: MassActionCommunicationMethod;
  messageSubject: IMultilingual;
  message: IMultilingual;
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

export interface IMassActionCaseFileStatusCreatePayload {
  name: string;
  description: string;
  eventId: uuid;
  status: CaseFileStatus;
  reason: IListOption;
  rationale: string;
  search: string;
  filter: string;
}

export interface IMassActionService extends IDomainBaseService<IMassActionEntity, uuid> {
  process(id: uuid, runType: MassActionRunType): Promise<IMassActionEntity>
  deactivate(id: uuid): Promise<IMassActionEntity>
  update(id: uuid, payload: { name: string; description: string }): Promise<IMassActionEntity>
  getInvalidFile({ massActionId, runId, language }: { massActionId: uuid; runId: uuid; language: string }): Promise<IRestResponse<string>>
  getEmailTemplate(emailTemplateKey: string, eventId?: uuid): Promise<IMultilingual>
  create(urlSuffix: string, payload: unknown): Promise<IMassActionEntity>
  exportList(massActionType: MassActionType, payload: IMassActionExportListPayload): Promise<IRestResponse<string>>
  getValidFile({ massActionId, runId, language, massActionType }: {
    massActionId: uuid;
    runId: uuid;
    language: string;
    massActionType?: MassActionType | MassActionDataCorrectionType
  }): Promise<IRestResponse<string>>
  downloadTemplate(massActionDataCorrectionType: MassActionType | MassActionDataCorrectionType): Promise<IRestResponse<BlobPart>>
}

export interface IMassActionServiceMock extends IDomainBaseServiceMock<IMassActionEntity> {
  process: jest.Mock<IMassActionEntity>;
  deactivate: jest.Mock<IMassActionEntity>;
  update: jest.Mock<IMassActionEntity>;
  getInvalidFile: jest.Mock<IRestResponse<string>>;
  getEmailTemplate: jest.Mock<IMultilingual>;
  create: jest.Mock<IMassActionEntity>;
  exportList: jest.Mock<IRestResponse<string>>;
  getValidFile: jest.Mock<IRestResponse<string>>;
  downloadTemplate: jest.Mock<IRestResponse<BlobPart>>;
}
