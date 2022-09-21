import { IAssessmentResponseMetadata } from '@libs/entities-lib/assessment-template';
import { BaseModule } from '@/store/modules/base';

export class AssessmentResponseMetadataModule extends BaseModule<IAssessmentResponseMetadata, { id: uuid }> {}
