import { IAssessmentFormMetadata } from '@libs/entities-lib/assessment-template';
import { IDomainBaseService } from '../../base';

export interface IAssessmentFormsMetadataService extends IDomainBaseService<IAssessmentFormMetadata, { id: uuid }> {}
