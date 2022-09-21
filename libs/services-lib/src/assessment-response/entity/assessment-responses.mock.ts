import { mockAssessmentResponseEntity, mockAssessmentResponseEntities } from '@libs/entities-lib/assessment-template';
import { mockDomainBaseService } from '../../base';
import { IAssessmentResponsesServiceMock } from './assessment-responses.types';

export const mockAssessmentResponsesService = (): IAssessmentResponsesServiceMock => ({
  ...mockDomainBaseService(mockAssessmentResponseEntities()),
  create: jest.fn(() => mockAssessmentResponseEntity()),
  update: jest.fn(() => mockAssessmentResponseEntity()),
  saveAssessmentAnsweredQuestions: jest.fn(() => mockAssessmentResponseEntity()),
});
