import {
  IAssessmentTemplateCombined, IAssessmentTemplateEntity, mockCombinedAssessmentTemplates, mockAssessmentTemplateEntity,
} from '@libs/entities-lib/assessment-template';
import { BaseMock } from '../base/base.mock';

export class AssessmentTemplateStorageMock extends BaseMock<IAssessmentTemplateCombined, IAssessmentTemplateEntity> {
  constructor() {
    super(mockCombinedAssessmentTemplates(), mockAssessmentTemplateEntity());
  }

  protected getters = {
    ...this.baseGetters,
    types: jest.fn(),
    outcomeStatuses: jest.fn(),
  }

  protected actions = {
    ...this.baseActions,
    create: jest.fn((payload: IAssessmentTemplateEntity) => payload),
    update: jest.fn((payload: IAssessmentTemplateEntity) => payload),
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
