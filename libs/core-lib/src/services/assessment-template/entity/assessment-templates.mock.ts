import { mockAssessmentTemplateEntity, mockAssessmentTemplateEntities } from '../../../entities/assessment-template';
import { mockDomainBaseService } from '../../base';
import { IAssessmentTemplatesServiceMock } from './assessment-templates.types';

export const mockAssessmentTemplatesService = (): IAssessmentTemplatesServiceMock => ({
  ...mockDomainBaseService(mockAssessmentTemplateEntities()),
  create: jest.fn(() => mockAssessmentTemplateEntity()),
  update: jest.fn(() => mockAssessmentTemplateEntity()),
});
