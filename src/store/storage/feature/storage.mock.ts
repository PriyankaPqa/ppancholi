import {
  IFeatureCombined, IFeatureEntity, mockFeatureEntity, mockCombinedFeatures,
} from '@/entities/feature';
import { BaseMock } from '../base/base.mock';

export class FeatureStorageMock extends BaseMock<IFeatureCombined, IFeatureEntity> {
  constructor() {
    super(mockCombinedFeatures(), mockFeatureEntity());
  }

  protected getters = {
    ...this.baseGetters,
    feature: jest.fn(() => mockFeatureEntity()),
  };

  protected actions = {
    ...this.baseActions,

    enableFeature: jest.fn(() => mockFeatureEntity()),
    disableFeature: jest.fn(() => mockFeatureEntity()),
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
