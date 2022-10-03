import { IMultilingual } from '@libs/shared-lib/types';
import _cloneDeep from 'lodash/cloneDeep';
import utils from '../utils';
import { BaseEntity, Status } from '../base';
import {
  AssessmentFormType, AssessmentFrequencyType, IAssessmentBaseEntity, IAssessmentQuestion, PublishStatus, SurveyJsAssessmentFormState,
} from './assessment-template.types';

export class AssessmentBaseEntity extends BaseEntity implements IAssessmentBaseEntity {
  name: IMultilingual;

  description: IMultilingual;

  messageIfUnavailable: IMultilingual;

  publishStatus: PublishStatus;

  assessmentFormType: AssessmentFormType;

  externalToolState: SurveyJsAssessmentFormState;

  questions: IAssessmentQuestion[];

  savePartialSurveyResults: boolean;

  frequency: AssessmentFrequencyType;

  constructor(data?: IAssessmentBaseEntity) {
    super(data);
    if (!data) {
      this.status = Status.Active;
    }
    this.savePartialSurveyResults = data?.savePartialSurveyResults;
    this.frequency = data?.frequency;
    this.name = utils.initMultilingualAttributes(data?.name);
    this.description = utils.initMultilingualAttributes(data?.description);
    this.messageIfUnavailable = utils.initMultilingualAttributes(data?.messageIfUnavailable);
    this.publishStatus = data?.publishStatus || PublishStatus.Unpublished;
    this.assessmentFormType = data?.assessmentFormType;
    this.externalToolState = data?.externalToolState ? _cloneDeep(data?.externalToolState) : new SurveyJsAssessmentFormState(null);
    this.questions = data?.questions || [];
  }

  public fillEmptyMultilingualAttributes() {
    this.name = utils.getFilledMultilingualField(this.name);
    this.description = utils.getFilledMultilingualField(this.description);
    this.messageIfUnavailable = utils.getFilledMultilingualField(this.messageIfUnavailable);
  }
}
