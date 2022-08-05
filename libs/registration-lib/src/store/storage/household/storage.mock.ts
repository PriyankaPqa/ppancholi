import {
  IHouseholdCombined, IHouseholdEntity, mockCombinedHouseholds, mockHouseholdEntity,
} from '@libs/entities-lib/household';
import { BaseMock } from '../base/base.mock';

export class HouseholdStorageMock extends BaseMock<IHouseholdCombined, IHouseholdEntity> {
  constructor() {
    super(mockCombinedHouseholds(), mockHouseholdEntity());
  }

  protected getters = {
    ...this.baseGetters,
  }

  protected actions = {
    ...this.baseActions,

    updateNoFixedHomeAddress: jest.fn(() => this.entity),
    updateHomeAddress: jest.fn(() => this.entity),
    fetchHouseholdHistory: jest.fn(),
  }

  protected mutations = {
    ...this.baseMutations,
    setSearchResultsShown: jest.fn(),
  }

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  })
}
