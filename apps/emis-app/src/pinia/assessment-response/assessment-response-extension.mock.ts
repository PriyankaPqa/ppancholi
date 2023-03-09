import { mockAssessmentResponseEntity } from '@libs/entities-lib/assessment-template';

export function getMockExtensionComponents() {
  return {
    create: jest.fn(() => Promise.resolve(mockAssessmentResponseEntity())),
    update: jest.fn(() => Promise.resolve(mockAssessmentResponseEntity())),
    saveAssessmentAnsweredQuestions: jest.fn(() => Promise.resolve(mockAssessmentResponseEntity())),
  };
}
