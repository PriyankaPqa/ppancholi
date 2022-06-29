import { IAssessmentTemplateMetadata } from '../../../entities/assessment-template/assessment-template.types';
import { IDomainBaseService } from '../../base';

export interface IAssessmentTemplatesMetadataService extends IDomainBaseService<IAssessmentTemplateMetadata, { id: uuid }> {}
