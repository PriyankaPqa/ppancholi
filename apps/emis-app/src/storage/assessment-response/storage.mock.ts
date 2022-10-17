import {
  IAssessmentResponseCombined, IAssessmentResponseEntity, mockCombinedAssessmentResponses, mockAssessmentResponseEntity,
} from '@libs/entities-lib/assessment-template';
import { BaseMock } from '../base/base.mock';

export class AssessmentResponseStorageMock extends BaseMock<IAssessmentResponseCombined, IAssessmentResponseEntity> {
  constructor() {
    super(mockCombinedAssessmentResponses(), mockAssessmentResponseEntity());
  }

  protected getters = {
    ...this.baseGetters,
    types: jest.fn(),
    outcomeStatuses: jest.fn(),
  }

  protected actions = {
    ...this.baseActions,
    create: jest.fn((payload: IAssessmentResponseEntity) => payload),
    update: jest.fn((payload: IAssessmentResponseEntity) => payload),
    saveAssessmentAnsweredQuestions: jest.fn((payload: IAssessmentResponseEntity) => payload),
    editAssessmentAnsweredQuestion: jest.fn((payload: IAssessmentResponseEntity) => payload),
  }

  protected mutations = {
    ...this.baseMutations,
  }

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  })
}
