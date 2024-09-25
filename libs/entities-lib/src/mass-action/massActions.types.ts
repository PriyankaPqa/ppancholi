import { IListOption, IMultilingual } from '@libs/shared-lib/types';
import { CaseFileStatus } from '../case-file';
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
  Assessment = 14,
  FinancialAssistanceCustomOptions = 15,
  CaseFileStatus = 16,
  Communication = 18,
  AddRemoveTeamMembers = 21,
}

// this is actually also part of MassActionType!!
export enum MassActionDataCorrectionType {
  DataCorrectionHomeAddress = 7,
  DataCorrectionLabels = 8,
  DataCorrectionTemporaryAddress = 9,
  DataCorrectionAuthenticationSpecifiedOther = 10,
  DataCorrectionIdentitySet = 11,
  DataCorrectionContactInformation = 12,
  DataCorrectionFinancialAssistance = 13,
  DataCorrectionAuthentication = 17,
  DataCorrectionTriage = 19,
  DataCorrectionMovePayments = 20,
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
  FailedPreProcessing = 5,
  FailedProcessing = 6,
}

export enum MassActionCommunicationMethod {
  Email = 1,
  SMS = 2,
}

export enum TeamMembersMassActionType {
  AddTeamMember = 1,
  RemoveTeamMember = 2,
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

export interface IMassActionAddRemoveTeamMembersDetails {
  teamId: string;
  teamMembersMassActionType: TeamMembersMassActionType;
}

export interface IMassActionAssessmentDetails {
  assessmentFormId: uuid;
  eventId: uuid;
  emailSubject: IMultilingual;
  emailTopCustomContent: IMultilingual;
  emailAdditionalDescription: IMultilingual;
}

export interface IMassActionCaseFileStatusDetails {
  status: CaseFileStatus;
  reason: IListOption;
  rationale: string ;
}

export interface IMassActionCommunicationDetails {
  eventId: uuid;
  method: MassActionCommunicationMethod;
  messageSubject: IMultilingual;
  message: IMultilingual;
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
