import { IMultilingual } from '@libs/shared-lib/types';
import { IEntity, IEntityCombined } from '../base';

export interface IAssessmentTemplateEntity extends IEntity {
  name: IMultilingual;
}

export interface IAssessmentTemplateMetadata extends IEntity {
  assessmentTemplateStatusName: IMultilingual;
}

export type IAssessmentTemplateCombined = IEntityCombined<IAssessmentTemplateEntity, IAssessmentTemplateMetadata>
