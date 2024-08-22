import { mockBaseData } from '@libs/entities-lib/base';
import {
  AssessmentFormType,
  AssessmentFrequencyType,
  IAnsweredQuestion,
  IAssessmentBaseEntity,
  IAssessmentFormEntity,
  IAssessmentResponseCreateRequest,
  IAssessmentResponseEntity,
  IAssessmentTemplateEntity,
  PublishStatus,
  SurveyJsAssessmentFormState,
  SurveyJsAssessmentResponseState,
} from '@libs/entities-lib/assessment-template/assessment-template.types';
import { IRegistrationAssessment } from '@libs/entities-lib/event';
import { getRandomNumber } from '../../helpers';
import {
  propertyStateMockEditAssessmentData,
  propertyStateMockRequestPartialAssessmentData,
  propertyStateMockSaveAssessmentData,
  propertyAnswersMockEditAssessmentData,
  propertyAnswersMockPartialAssessmentData,
  propertyAnswersMockSaveAssessmentData,
  propertyStateMockAllComponentsData,
  propertyStateMockUpdateAssessmentData,
  propertyQuestionsMockAllComponentsData,
  propertyQuestionsMockUpdateAssessmentObject,
  rawPropertyStateMockEditAssessmentData,
  rawPropertyStateMockPartialAssessmentData,
  rawPropertyStateMockSaveAssessmentData,
} from './survey-questions';

export const mockAssessmentBaseEntity = (force?: Partial<IAssessmentTemplateEntity>): IAssessmentBaseEntity => ({
  ...mockBaseData(force),
  name: {
    translation: {
      en: `test assessment -s${getRandomNumber()}`,
      fr: `test assessment -fr -s${getRandomNumber()}`,
    },
  },
  description: {
    translation: {
      en: 'assessment desc en',
      fr: 'assessment desc fr',
    },
  },
  messageIfUnavailable: null,
  publishStatus: PublishStatus.Published,
  assessmentFormType: AssessmentFormType.AssessmentForm,
  externalToolState: null,
  savePartialSurveyResults: true,
  frequency: AssessmentFrequencyType.Multiple,
  questions: null,
  scoringRanges: null,
  ...force,
});

export const mockCreateAssessmentRequest = (force?: Partial<IAssessmentFormEntity>): IAssessmentFormEntity => ({
  ...mockAssessmentBaseEntity(),
  eventId: '044fcd68-3d70-4a3a-b5c8-22da9e01730f',
  programId: '0f6c1714-045a-4054-8133-c96abb94782a',
  ...force,
});

export const mockUpdateAssessmentRequest = (id: string, force?: Partial<IAssessmentFormEntity>): IAssessmentFormEntity => ({
  ...mockAssessmentBaseEntity(force),
  id,
  // eslint-disable-next-line
  externalToolState: new SurveyJsAssessmentFormState(JSON.stringify(propertyStateMockUpdateAssessmentData)),
  scoringRanges: [],
  name: {
    translation: {
      en: 'test assessment - en',
      fr: 'test assessment - fr',
    },
  },
  description: {
    translation: {
      en: 'test assessment - desc - en',
      fr: 'test assessment - desc - fr',
    },
  },
  messageIfUnavailable: {
    translation: {
      en: 'message',
      fr: 'message',
    },
  },
  questions: propertyQuestionsMockUpdateAssessmentObject,
  eventId: '',
  programId: '',
  ...force,
});

export const mockUpdateAssessmentWithAllPossibleComponentsRequest = (id: string, force?: Partial<IAssessmentFormEntity>): IAssessmentFormEntity => ({
  ...mockAssessmentBaseEntity(force),
  id,
  externalToolState: new SurveyJsAssessmentFormState(JSON.stringify(propertyStateMockAllComponentsData)),
  scoringRanges: [],
  name: {
    translation: {
      en: 'Test Assessment With All Possible Components - en',
      fr: 'Test Assessment - fr',
    },
  },
  description: {
    translation: {
      en: 'Description - en',
      fr: 'Description - fr',
    },
  },
  messageIfUnavailable: {
    translation: {
      en: 'message',
      fr: 'message',
    },
  },
  questions: propertyQuestionsMockAllComponentsData,
  eventId: '',
  programId: '',
  ...force,
});

export const mockAssessmentResponseRequest = (caseFileId: string, assessmentFormId: string): IAssessmentResponseCreateRequest => ({
  association: {
    id: caseFileId,
    type: 1,
  },
  assessmentFormId,
});

// eslint-disable-next-line
export const mockPartialSaveAssessmentAnsweredQuestionsRequest = (id: string, caseFileId: string, assessmentFormId: string, force?: Partial<IAssessmentResponseEntity>): IAssessmentResponseEntity => ({
  ...mockBaseData(),
  ...mockAssessmentResponseRequest(caseFileId, assessmentFormId),
  id,
  completionStatus: 2,
  externalToolState: new SurveyJsAssessmentResponseState(
    JSON.stringify(rawPropertyStateMockPartialAssessmentData),
    JSON.stringify(propertyStateMockRequestPartialAssessmentData),
  ),
  answeredQuestions: propertyAnswersMockPartialAssessmentData,
  answeredQuestionsHistory: [],
  dateAssigned: new Date(),
  ...force,
});

// eslint-disable-next-line
export const mockSaveAssessmentAnsweredQuestionsRequest = (id: string, caseFileId: string, assessmentFormId: string, force?: Partial<IAssessmentResponseEntity>): IAssessmentResponseEntity => ({
  ...mockPartialSaveAssessmentAnsweredQuestionsRequest(id, caseFileId, assessmentFormId),
  externalToolState: new SurveyJsAssessmentResponseState(
    JSON.stringify(rawPropertyStateMockSaveAssessmentData),
    JSON.stringify(propertyStateMockSaveAssessmentData),
  ),
  answeredQuestions: propertyAnswersMockSaveAssessmentData,
  ...force,
});

// eslint-disable-next-line
export const mockEditAssessmentAnsweredQuestionsRequest = (id: string, caseFileId: string, assessmentFormId: string, answeredQuestionsHistory: IAnsweredQuestion[], force?: Partial<IAssessmentResponseEntity>): IAssessmentResponseEntity => ({
  ...mockSaveAssessmentAnsweredQuestionsRequest(id, caseFileId, assessmentFormId),
  externalToolState: new SurveyJsAssessmentResponseState(
    JSON.stringify(rawPropertyStateMockEditAssessmentData),
    JSON.stringify(propertyStateMockEditAssessmentData),
  ),
  answeredQuestions: propertyAnswersMockEditAssessmentData,
  answeredQuestionsHistory,
  ...force,
});

export const mockEventToPresentAssessmentToUserUponRegistrationRequest = (assessmentId: string): IRegistrationAssessment => ({
  ...mockBaseData(),
  assessmentId,
  sectionTitle: {
    translation: {
      en: 'My Assessment title',
      fr: "C'est le grand cours",
    },
  },
  details: {
    translation: {
      en: 'This is my entered description',
      fr: "C'est cours est va amusant",
    },
  },
});
