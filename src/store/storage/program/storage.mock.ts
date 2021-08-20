import {
  IProgramCombined, IProgramEntity, mockCombinedPrograms, mockProgramEntity,
} from '@/entities/program';
import { BaseMock } from '../base/base.mock';

export class ProgramStorageMock extends BaseMock<IProgramCombined, IProgramEntity> {
  constructor() {
    super(mockCombinedPrograms(), mockProgramEntity());
  }

  protected getters = {
    ...this.baseGetters,
  };

  protected actions = {
    ...this.baseActions,
    createProgram: jest.fn((payload: IProgramEntity) => payload),
    updateProgram: jest.fn((payload: IProgramEntity) => payload),
  };

  protected mutations = {
    ...this.baseMutations,
  };

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  });
}
