import { mockAssessmentResponseEntity, mockAssessmentResponseEntities } from '@libs/entities-lib/assessment-template';
import { mockDomainBaseService } from '../../base';
import { IAssessmentResponsesServiceMock } from './assessment-responses.types';

export const mockAssessmentResponsesService = (): IAssessmentResponsesServiceMock => ({
  ...mockDomainBaseService(mockAssessmentResponseEntities()),
  getForBeneficiary: jest.fn(() => mockAssessmentResponseEntity()),
  create: jest.fn(() => mockAssessmentResponseEntity()),
  update: jest.fn(() => mockAssessmentResponseEntity()),
  saveAssessmentAnsweredQuestions: jest.fn(() => mockAssessmentResponseEntity()),
  completeSurvey: jest.fn(() => mockAssessmentResponseEntity()),
  completeSurveyByBeneficiary: jest.fn(() => mockAssessmentResponseEntity()),
});
