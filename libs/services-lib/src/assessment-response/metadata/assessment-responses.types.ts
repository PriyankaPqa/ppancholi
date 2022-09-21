import { IAssessmentResponseMetadata } from '@libs/entities-lib/assessment-template';
import { IDomainBaseService } from '../../base';

export interface IAssessmentResponsesMetadataService extends IDomainBaseService<IAssessmentResponseMetadata, { id: uuid }> {}
