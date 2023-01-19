import { mockAssessmentFormEntity } from '@libs/entities-lib/assessment-template';

export function getMockExtensionComponents() {
  return {
    fetchByProgramId: jest.fn(() => Promise.resolve([mockAssessmentFormEntity()])),
    create: jest.fn(() => Promise.resolve(mockAssessmentFormEntity())),
    update: jest.fn(() => Promise.resolve(mockAssessmentFormEntity())),
    updateAssessmentStructure: jest.fn(() => Promise.resolve(mockAssessmentFormEntity())),
  };
}
