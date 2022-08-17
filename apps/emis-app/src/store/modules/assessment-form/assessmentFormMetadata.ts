import { IAssessmentFormMetadata } from '@libs/entities-lib/assessment-template';
import { BaseModule } from '@/store/modules/base';

export class AssessmentFormMetadataModule extends BaseModule<IAssessmentFormMetadata, { id: uuid }> {}
