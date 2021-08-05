import {
  IMassActionCombined, IMassActionEntity, mockCombinedMassActions, mockMassActionEntity,
} from '@/entities/mass-action';
import { BaseMock } from '../base/base.mock';

export class MassActionStorageMock extends BaseMock<IMassActionCombined, IMassActionEntity> {
  constructor() {
    super(mockCombinedMassActions(), mockMassActionEntity());
  }

  protected getters = {
    ...this.baseGetters,
  }

  protected actions = {
    ...this.baseActions,
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
