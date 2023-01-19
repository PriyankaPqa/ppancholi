import { mockAssessmentTemplateEntity } from '@libs/entities-lib/assessment-template';

export function getMockExtensionComponents() {
  return {
    create: jest.fn(() => Promise.resolve(mockAssessmentTemplateEntity())),
    update: jest.fn(() => Promise.resolve(mockAssessmentTemplateEntity())),
    updateAssessmentStructure: jest.fn(() => Promise.resolve(mockAssessmentTemplateEntity())),
  };
}
