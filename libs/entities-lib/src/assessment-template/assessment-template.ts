import { IMultilingual } from '@libs/core-lib/types';
import utils from '../utils';
import { BaseEntity } from '../base';
import { IAssessmentTemplateEntity } from './assessment-template.types';

export class AssessmentTemplateEntity extends BaseEntity implements IAssessmentTemplateEntity {
  name: IMultilingual;

  constructor(data?: IAssessmentTemplateEntity) {
    if (data) {
      super(data);
      this.name = utils.initMultilingualAttributes(data.name);
    } else {
      super();
      this.name = utils.initMultilingualAttributes();
    }
  }
}
