import { mockAssessmentFormEntity, mockAssessmentFormEntities, mockAssessmentTotalSubmissions } from '@libs/entities-lib/assessment-template';
import { mockDomainBaseService } from '../../base';
import { IAssessmentFormsServiceMock } from './assessment-forms.types';

export const mockAssessmentFormsService = (): IAssessmentFormsServiceMock => ({
  ...mockDomainBaseService(mockAssessmentFormEntities()),
  getForBeneficiary: jest.fn(() => mockAssessmentFormEntity()),
  create: jest.fn(() => mockAssessmentFormEntity()),
  update: jest.fn(() => mockAssessmentFormEntity()),
  updateAssessmentStructure: jest.fn(() => mockAssessmentFormEntity()),
  fetchByProgramId: jest.fn(() => [mockAssessmentFormEntity()]),
  htmlToWord: jest.fn(() => 'url'),
  assessmentTotalSubmissions: jest.fn(() => mockAssessmentTotalSubmissions()),
});
