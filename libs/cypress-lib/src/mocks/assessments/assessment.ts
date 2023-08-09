import { mockBaseData } from '@libs/entities-lib/src/base';
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
  SurveyJsAssessmentResponseState } from '@libs/entities-lib/assessment-template/assessment-template.types';
import { getRandomNumber } from '../../helpers';

export const mockAssessmentBaseEntity = (force? : Partial<IAssessmentTemplateEntity>) : IAssessmentBaseEntity => ({
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

export const mockCreateAssessmentRequest = (force? : Partial<IAssessmentFormEntity>) : IAssessmentFormEntity => ({
  ...mockAssessmentBaseEntity(),
  eventId: '044fcd68-3d70-4a3a-b5c8-22da9e01730f',
  programId: '0f6c1714-045a-4054-8133-c96abb94782a',
  ...force,
});

export const mockUpdateAssessmentRequest = (id: string, force? : Partial<IAssessmentFormEntity>) : IAssessmentFormEntity => ({
  ...mockAssessmentBaseEntity(force),
  id,
  // eslint-disable-next-line
  externalToolState: new SurveyJsAssessmentFormState('{\n \"logo\": {\n  \"default\": \"https://api-dev.crc-tech.ca//system-management/tenant-settings/56f61c9c-0a6f-4be2-954d-941c9f02cb4c/logo/en\",\n  \"fr\": \"https://api-dev.crc-tech.ca//system-management/tenant-settings/56f61c9c-0a6f-4be2-954d-941c9f02cb4c/logo/fr\"\n },\n \"logoPosition\": \"right\",\n \"pages\": [\n  {\n   \"name\": \"page1\",\n   \"elements\": [\n    {\n     \"type\": \"yes-no\",\n     \"name\": \"question1\",\n     \"title\": \"Do you have school aged children\",\n     \"scoreFalse\": 10,\n     \"scoreTrue\": 5\n    },\n    {\n     \"type\": \"boolean\",\n     \"name\": \"question2\",\n     \"title\": \"Is you home livable ?\"\n    }\n   ]\n  }\n ],\n \"clearInvisibleValues\": \"onHiddenContainer\"\n}'),
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
  questions: [
    {
      identifier: 'question1',
      questionType: 'yes-no',
      question: {
        translation: {
          en: 'Do you have school aged children ?',
          fr: 'Do you have school aged children ?',
        },
      },
      answerChoices: [{
        identifier: 'yes',
        displayValue: {
          translation: {
            en: 'Yes',
            fr: 'Oui',
          },
        },
        textValue: 'yes',
        score: 10,
      },
      {
        identifier: 'no',
        displayValue: {
          translation: {
            en: 'No',
            fr: 'Non',
          },
        },
        textValue: 'no',
        score: 5,
      }],
    },
    {
      identifier: 'question2',
      questionType: 'boolean',
      question: {
        translation: {
          en: 'Is you home livable ?',
          fr: 'Is you home livable ?',
        },
      },
      answerChoices: [{
        identifier: 'true',
        displayValue: {
          translation: {
            en: 'Yes',
            fr: 'Oui',
          },
        },
        textValue: 'true',
        score: null,
      },
      {
        identifier: 'false',
        displayValue: {
          translation: {
            en: 'No',
            fr: 'Non',
          },
        },
        textValue: 'false',
        score: null,
      }] },
  ],
  eventId: '',
  programId: '',
  ...force,
});

export const mockAssessmentResponseRequest = (caseFileId:string, assessmentFormId:string) : IAssessmentResponseCreateRequest => ({
  association: {
    id: caseFileId,
    type: 1,
  },
  assessmentFormId,
});

// eslint-disable-next-line
export const mockPartialSaveAssessmentAnsweredQuestionsRequest = (id: string, caseFileId:string, assessmentFormId:string, force? : Partial<IAssessmentResponseEntity>) : IAssessmentResponseEntity => ({
...mockBaseData(),
...mockAssessmentResponseRequest(caseFileId, assessmentFormId),
id,
completionStatus: 2,
// eslint-disable-next-line
externalToolState: new SurveyJsAssessmentResponseState('{\"question1\":\"no\",\"_currentPageNo\":0}','[{\"name\":\"question1\",\"title\":\"Do you have school aged children\",\"value\":\"no\",\"displayValue\":\"Non\",\"isNode\":false,\"questionType\" \"yes-no\"}]'),
answeredQuestions: [{ assessmentQuestionIdentifier: 'question1', responses: [{ displayValue: 'Non', textValue: 'no', numericValue: null }] }],
answeredQuestionsHistory: [],
dateAssigned: new Date(),
...force,
});

// eslint-disable-next-line
export const mockSaveAssessmentAnsweredQuestionsRequest = (id: string, caseFileId:string, assessmentFormId:string, force? : Partial<IAssessmentResponseEntity>) : IAssessmentResponseEntity => ({
  ...mockPartialSaveAssessmentAnsweredQuestionsRequest(id, caseFileId, assessmentFormId),
  // eslint-disable-next-line
  externalToolState: new SurveyJsAssessmentResponseState('{\"question1\":\"no\",\"question2\":false,\"_currentPageNo\":0}','[{\"name\":\"question1\",\"title\":\"Do you have school aged children\",\"value\":\"no\",\"displayValue\":\"Non\",\"isNode\":false,\"questionType\":\"yes-no\"},{\"name\":\"question2\",\"title\":\"Is you home livable ?\",\"value\":false,\"displayValue\":\"Non\",\"isNode\":false,\"questionType\":\"boolean\"}]'),
  // eslint-disable-next-line
  answeredQuestions: [{"assessmentQuestionIdentifier":"question1","responses":[{"displayValue":"Non","textValue":"no","numericValue":null}]},{"assessmentQuestionIdentifier":"question2","responses":[{"displayValue":"Non","textValue":"false","numericValue":null}]}],
  ...force,
});

// eslint-disable-next-line
export const mockEditAssessmentAnsweredQuestionsRequest = (id: string, caseFileId:string, assessmentFormId:string, answeredQuestionsHistory: IAnsweredQuestion[], force? : Partial<IAssessmentResponseEntity>) : IAssessmentResponseEntity => ({
  ...mockSaveAssessmentAnsweredQuestionsRequest(id, caseFileId, assessmentFormId),
  // eslint-disable-next-line
  externalToolState: new SurveyJsAssessmentResponseState('{\"question1\":\"yes\",\"question2\":false,\"_currentPageNo\":0}','[{\"name\":\"question1\",\"title\":\"Do you have school aged children\",\"value\":\"yes\",\"displayValue\":\"Yes\",\"isNode\":false,\"questionType\":\"yes-no\"},{\"name\":\"question2\",\"title\":\"Is you home livable ?\",\"value\":false,\"displayValue\":\"Non\",\"isNode\":false,\"questionType\":\"boolean\"}]'),
  // eslint-disable-next-line
  answeredQuestions: [{"assessmentQuestionIdentifier":"question1","responses":[{"displayValue":"Yes","textValue":"yes","numericValue":null}]},{"assessmentQuestionIdentifier":"question2","responses":[{"displayValue":"Non","textValue":"false","numericValue":null}]}],
  answeredQuestionsHistory,
  ...force,
});
