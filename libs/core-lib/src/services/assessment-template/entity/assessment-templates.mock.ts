import { mockAssessmentTemplateEntity, mockAssessmentTemplateEntities } from '@libs/entities-lib/assessment-template';
import { mockDomainBaseService } from '../../base';
import { IAssessmentTemplatesServiceMock } from './assessment-templates.types';

export const mockAssessmentTemplatesService = (): IAssessmentTemplatesServiceMock => ({
  ...mockDomainBaseService(mockAssessmentTemplateEntities()),
  create: jest.fn(() => mockAssessmentTemplateEntity()),
  update: jest.fn(() => mockAssessmentTemplateEntity()),
});
