import { IAssessmentTemplateMetadata } from '@libs/entities-lib/assessment-template';
import { BaseModule } from '@/store/modules/base';

export class AssessmentTemplateMetadataModule extends BaseModule<IAssessmentTemplateMetadata, { id: uuid }> {}
