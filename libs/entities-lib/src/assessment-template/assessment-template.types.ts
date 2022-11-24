/* eslint-disable max-classes-per-file */
import { IMultilingual } from '@libs/shared-lib/types';
import { IEntity, IEntityCombined } from '../base';

export interface IAssessmentBaseMetadata extends IEntity {
  assessmentTemplateStatusName: IMultilingual;
}

export interface IAssessmentTemplateMetadata extends IAssessmentBaseMetadata {
}

export interface IAssessmentFormMetadata extends IAssessmentBaseMetadata {
  programName: IMultilingual;
  totalSubmissions: number;
}

export enum AssessmentFormType {
  AssessmentTemplate = 1,
  AssessmentForm = 2,
}

export enum AssessmentFrequencyType {
  OneTime = 1,
  Multiple = 2,
}

export enum PublishStatus {
  Unpublished = 1,
  Published = 2,
}

export enum CompletionStatus {
  Pending = 1,
  Partial = 2,
  Completed = 3,
  Obsolete = 4,
}

export enum AssociationType {
  CaseFile = 1,
}

export enum CompletedByType {
  Crc = 1,
  Public = 2,
}

export interface IExternalToolState {
  tool: string;
  data: { [key: string]: string; };
}

export class SurveyJsAssessmentFormState implements IExternalToolState {
  tool = 'SurveyJs';

  data: { rawJson: string };

  constructor(rawJson: string) {
    this.data = { rawJson };
  }
}

export class SurveyJsAssessmentResponseState implements IExternalToolState {
  tool = 'SurveyJs';

  data: { rawJson: string, denormalizedJson: string };

  constructor(rawJson: string, denormalizedJson: string) {
    this.data = { rawJson, denormalizedJson };
  }
}

export interface IAssessmentAnswerChoice {
  identifier: string;
  displayValue: IMultilingual;
  textValue: string;
  numericValue?: number | null;
  score?: number | null;
}

export interface IAssessmentQuestion {
  identifier: string;
  question: IMultilingual;
  questionType: string;
  score?: number | null;
  answerChoices: IAssessmentAnswerChoice[];
}

export interface IAssessmentBaseEntity extends IEntity {
  name: IMultilingual;
  description: IMultilingual;
  messageIfUnavailable: IMultilingual;
  publishStatus: PublishStatus;
  savePartialSurveyResults: boolean;
  frequency: AssessmentFrequencyType;
  assessmentFormType: AssessmentFormType;
  externalToolState: SurveyJsAssessmentFormState;
  questions: IAssessmentQuestion[];
}

export interface IAssessmentTemplateEntity extends IAssessmentBaseEntity {
}

export interface IAssessmentFormEntity extends IAssessmentBaseEntity {
  eventId: uuid;
  programId: uuid | null;
}

export interface IQuestionResponse {
  displayValue: string;
  textValue: string;
  numericValue?: number;
}

export interface IAnsweredQuestion {
  assessmentQuestionIdentifier: string;
  responses: IQuestionResponse[];
  crcUserId?: uuid;
  crcUserName?: string;
  answeredOn?: string;
  parentIndexPath?: string;
}

export interface IAssessmentAssociation {
  id: string;
  type: AssociationType;
}

export interface IAssessmentResponseCreateRequest {
  association: IAssessmentAssociation;
  assessmentFormId: uuid;
}

export interface IAssessmentResponseEntity extends IEntity {
  association: IAssessmentAssociation;
  assessmentFormId: uuid;
  completionStatus: CompletionStatus;
  externalToolState: SurveyJsAssessmentResponseState;
  answeredQuestions: IAnsweredQuestion[];
  answeredQuestionsHistory: IAnsweredQuestion[];
  totalScore?: number;
  dateAssigned: Date;
  dateStarted?: Date;
  dateCompleted?: Date;
  completedBy?: {
    type: CompletedByType,
    crcUserId: string,
    crcUserName: string,
  };
}

export interface IAssessmentResponseMetadata extends IEntity {
}

export type IAssessmentResponseCombined = IEntityCombined<IAssessmentResponseEntity, IAssessmentResponseMetadata>;
export type IAssessmentTemplateCombined = IEntityCombined<IAssessmentTemplateEntity, IAssessmentTemplateMetadata>;
export type IAssessmentFormCombined = IEntityCombined<IAssessmentFormEntity, IAssessmentFormMetadata>;
export type IAssessmentBaseCombined = IEntityCombined<IAssessmentBaseEntity, IAssessmentBaseMetadata>;
