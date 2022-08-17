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
  AssessmentForm = 2
}

export enum AssessmentFrequencyType {
  OneTime = 1,
  Multiple = 2
}

export enum PublishStatus {
  Unpublished = 1,
  Published = 2
}

export enum CompletionStatus {
  Pending,
  Partial,
  Completed,
  Obsolete
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
  numericValue: number | null;
  score: number | null;
}

export interface IAssessmentQuestion {
  identifier: string;
  question: IMultilingual;
  questionType: string;
  score: number | null;
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
  answeredOn?: string;
}

export interface IAssessmentResponseEntity extends IEntity {
  assessmentFormId: uuid;
  completionStatus: CompletionStatus;
  uniqueUrl: string;
  externalToolState: SurveyJsAssessmentResponseState;
  answeredQuestions: IAnsweredQuestion[];
  answeredQuestionsHistory: IAnsweredQuestion[];
  totalScore?: number;
  dateAssigned: Date;
  dateStarted?: Date;
  dateCompleted?: Date;
}

export type IAssessmentTemplateCombined = IEntityCombined<IAssessmentTemplateEntity, IAssessmentTemplateMetadata>
export type IAssessmentFormCombined = IEntityCombined<IAssessmentFormEntity, IAssessmentFormMetadata>
export type IAssessmentBaseCombined = IEntityCombined<IAssessmentBaseEntity, IAssessmentBaseMetadata>
