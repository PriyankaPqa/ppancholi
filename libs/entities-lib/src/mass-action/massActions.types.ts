import { IMultilingual } from '@libs/shared-lib/src/types';
import { EPaymentModalities } from '../program';
import { IEntity, IEntityCombined } from '../base';

export enum MassActionGroup {
  Unknown = 0,
  Group1 = 1,
  Group2 = 2,
  Group3 = 3,
  Group4 = 4,
  Group5 = 5,
}

export enum MassActionType {
  Unknown = 0,
  FinancialAssistance = 1,
  ImportValidationOfImpactStatus = 2,
  ExportValidationOfImpactStatus = 3,
  GenerateFundingRequest = 4,
  ImportPaymentStatuses = 5,
  ImportUsers = 6,
  Assessments = 14,
  FinancialAssistanceCustomOptions = 15,
}

// this is actually also part of MassActionType!!
export enum MassActionDataCorrectionType {
  HomeAddress = 7,
  Labels = 8,
  TemporaryAddress = 9,
  AuthenticationSpecifiedOther = 10,
  IdentitySet = 11,
  ContactInformation = 12,
  FinancialAssistance = 13,
}

export enum MassActionMode {
  File = 'file',
  List = 'list',
  NoAttachment = 'noAttachment',
}

export enum MassActionRunType {
  Unknown = 0,
  PreProcess = 1,
  Process = 2,
}
export enum MassActionRunStatus {
  Unknown = 0,
  PreProcessing = 1,
  PreProcessed = 2,
  Processing = 3,
  Processed = 4,
}

export interface IMassActionDetails {
  paymentModality?: EPaymentModalities;
  amount?: number;
  eventId?: uuid;
  mainCategoryId?: uuid;
  programId?: uuid;
  subCategoryId?: uuid;
  tableId?: uuid;
}

export interface IMassActionAssessmentDetails {
  assessmentFormId: uuid;
  eventId: uuid;
  emailSubject: IMultilingual;
  emailAdditionalDescription: IMultilingual;
}

export interface IMassActionRun extends IEntity {
  started: Date | string;
  completed: Date | string;
  runType: MassActionRunType;
  runStatus: MassActionRunStatus;
}

export interface IMassActionRunResultMetadataModel {
  total: number;
  successes: number;
  failures: number;
}

export interface IMassActionErrorResultMetadataModel {
  error: string;
  total: number;
}

export interface IMassActionRunMetadataModel {
  runId: uuid;
  results: IMassActionRunResultMetadataModel;
  errors: Array<IMassActionErrorResultMetadataModel>;
  started: Date | string;
  completed: Date | string;
  runType: MassActionRunType;
  runStatus: MassActionRunStatus;
  totalAmount?: number;
  projectedAmount?: number;
}

export interface IMassActionEntityData extends IEntity {
  name: string;

  description: string;

  details: IMassActionDetails;

  type: MassActionType | MassActionDataCorrectionType;

  group: MassActionGroup;

  runs: Array<IMassActionRun>;
}

export interface IMassActionEntity extends IMassActionEntityData {
  validate(): Array<string> | boolean;
}

export interface IMassActionMetadata extends IEntity {
  runs: Array<IMassActionRunMetadataModel>;
  lastRun: IMassActionRunMetadataModel;
}

export type IMassActionCombined = IEntityCombined<IMassActionEntity, IMassActionMetadata>;

export type IdParams = uuid;
