import {
  IFeatureCombined, IFeatureEntity, mockFeatureEntity, mockCombinedFeature,
} from '@/entities/feature';
import { BaseMock } from '../base/base.mock';

export class FeatureStorageMock extends BaseMock<IFeatureCombined, IFeatureEntity> {
  constructor() {
    super([mockCombinedFeature()], mockFeatureEntity());
  }

  protected getters = {
    ...this.baseGetters,
    feature: jest.fn(() => mockFeatureEntity()),
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
