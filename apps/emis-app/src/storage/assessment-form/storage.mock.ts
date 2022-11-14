import {
  IAssessmentFormCombined, IAssessmentFormEntity, mockCombinedAssessmentForms, mockAssessmentFormEntity,
} from '@libs/entities-lib/assessment-template';
import { BaseMock } from '../base/base.mock';

export class AssessmentFormStorageMock extends BaseMock<IAssessmentFormCombined, IAssessmentFormEntity> {
  constructor() {
    super(mockCombinedAssessmentForms(), mockAssessmentFormEntity());
  }

  protected getters = {
    ...this.baseGetters,
    types: jest.fn(),
    outcomeStatuses: jest.fn(),
  }

  protected actions = {
    ...this.baseActions,
    create: jest.fn((payload: IAssessmentFormEntity) => payload),
    update: jest.fn((payload: IAssessmentFormEntity) => payload),
    updateAssessmentStructure: jest.fn((payload: IAssessmentFormEntity) => payload),
    fetchByProgramId: jest.fn(() => [mockAssessmentFormEntity()]),
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
