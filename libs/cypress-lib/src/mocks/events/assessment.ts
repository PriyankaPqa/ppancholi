import { mockBaseData } from '@libs/entities-lib/src/base';
import {
  AssessmentFormType,
  AssessmentFrequencyType,
  IAssessmentBaseEntity,
  IAssessmentFormEntity,
  IAssessmentTemplateEntity,
  PublishStatus } from '@libs/entities-lib/assessment-template/assessment-template.types';
import { getRandomNumber } from '../../helpers';

export const mockAssessmentBaseEntity = (force? : Partial<IAssessmentTemplateEntity>) : IAssessmentBaseEntity => ({
  ...mockBaseData(),
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
  savePartialSurveyResults: false,
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
