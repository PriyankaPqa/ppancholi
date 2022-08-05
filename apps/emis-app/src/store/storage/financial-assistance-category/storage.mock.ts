import {
  IOptionItem, IOptionItemCombined, mockCombinedOptionItems, mockOptionItem,
} from '@libs/entities-lib/optionItem';
import { BaseMock } from '../base/base.mock';

export class FinancialAssistanceCategoryStorageMock extends BaseMock<IOptionItemCombined, IOptionItem> {
  constructor() {
    super(mockCombinedOptionItems(), mockOptionItem());
  }

  protected getters = {
    ...this.baseGetters,
  };

  protected actions = {
    ...this.baseActions,
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
