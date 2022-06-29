import { IAssessmentTemplateMetadata } from '@libs/core-lib/entities/assessment-template';
import { BaseModule } from '@/store/modules/base';

export class AssessmentTemplateMetadataModule extends BaseModule<IAssessmentTemplateMetadata, { id: uuid }> {}
