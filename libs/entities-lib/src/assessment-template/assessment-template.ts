import { IAssessmentTemplateEntity } from './assessment-template.types';
import { AssessmentBaseEntity } from './assessment-base';

export class AssessmentTemplateEntity extends AssessmentBaseEntity implements IAssessmentTemplateEntity {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(data?: IAssessmentTemplateEntity) {
    super(data);
  }
}
