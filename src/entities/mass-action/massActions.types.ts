import { IEntity, IEntityCombined } from '@/entities/base';
import { EPaymentModalities } from '@/entities/program';

export enum MassActionGroup {
  Unknown = 0,
  Group1 = 1,
  Group2 = 2,
  Group3 = 3,
  Group4 = 4
}

export enum MassActionType {
  Unknown = 0,
  FinancialAssistance = 1,
  ImportValidationOfImpactStatus = 2,
  ExportValidationOfImpactStatus = 3,
  GenerateFundingRequest = 4,
  ImportPaymentStatuses = 5
}

export enum MassActionRunType {
  Unknown = 0,
  PreProcess = 1,
  Process = 2
}
export enum MassActionRunStatus {
  Unknown = 0,
  PreProcessing = 1,
  PreProcessed = 2,
  Processing = 3,
  Processed = 4,
}

export interface IMassActionDetails {
  paymentModality?: EPaymentModalities
  amount?: number;
  eventId?: uuid;
  itemId?: uuid;
  programId?: uuid;
  subItemId?: uuid;
  tableId? : uuid;
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

export interface IMassActionErrorResultMetadataModel{
  error: string;
  total: number;
}

export interface IMassActionRunMetadataModel {
  runId: uuid;
  results: IMassActionRunResultMetadataModel;
  errors: Array<IMassActionErrorResultMetadataModel>
  started: Date | string;
  completed: Date | string;
  runType: MassActionRunType;
  runStatus: MassActionRunStatus;
  totalAmount?: number;
}

export interface IMassActionEntityData extends IEntity {
  name: string;

  description: string;

  details: IMassActionDetails;

  type: MassActionType;

  group: MassActionGroup;

  runs: Array<IMassActionRun>
}

export interface IMassActionEntity extends IMassActionEntityData {
  validate(): Array<string> | boolean;
}

export interface IMassActionMetadata extends IEntity {
  runs: Array<IMassActionRunMetadataModel>
  lastRun: IMassActionRunMetadataModel
}

export type IMassActionCombined = IEntityCombined<IMassActionEntity, IMassActionMetadata>
