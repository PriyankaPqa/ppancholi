import { mockAssessmentFormEntity, mockAssessmentFormEntities } from '@libs/entities-lib/assessment-template';
import { mockDomainBaseService } from '../../base';
import { IAssessmentFormsServiceMock } from './assessment-forms.types';

export const mockAssessmentFormsService = (): IAssessmentFormsServiceMock => ({
  ...mockDomainBaseService(mockAssessmentFormEntities()),
  create: jest.fn(() => mockAssessmentFormEntity()),
  update: jest.fn(() => mockAssessmentFormEntity()),
  updateAssessmentStructure: jest.fn(() => mockAssessmentFormEntity()),
});
