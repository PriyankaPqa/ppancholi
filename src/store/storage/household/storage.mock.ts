import { BaseMock } from '../base/base.mock';

import {
  IHouseholdCombined, IHouseholdEntity, mockCombinedHouseholds, mockHouseholdEntity,
} from '../../../entities/household';

export class HouseholdStorageMock extends BaseMock<IHouseholdCombined, IHouseholdEntity> {
  constructor() {
    super(mockCombinedHouseholds(), mockHouseholdEntity());
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
