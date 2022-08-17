import { IAssessmentTemplateEntity } from './assessment-template.types';
import { AssessmentBaseEntity } from './assessment-base';

export class AssessmentTemplateEntity extends AssessmentBaseEntity implements IAssessmentTemplateEntity {
  constructor(data?: IAssessmentTemplateEntity) {
    super(data);
  }
}
