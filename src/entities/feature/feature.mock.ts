import { IEntity, mockBaseData } from '@/entities/base';
import { IFeatureCombined, IFeatureEntity, IFeatureEntityData } from './feature.types';

export const mockFeatureEntityData = (force?: Partial<IFeatureEntityData>): IFeatureEntityData => ({
  ...mockBaseData(),

  name: 'feature name',

  description: {
    translation: {
      en: 'description en',
      fr: 'description en',
    },
  },

  enabled: false,

  ...force,
});

export const mockFeatureEntity = (force?: Partial<IFeatureEntity>): IFeatureEntity => ({
  ...mockFeatureEntityData(),

  ...force,
});

export const mockCombinedFeature = (force?: Partial<IEntity>): IFeatureCombined => ({
  metadata: null as never,
  entity: mockFeatureEntity(force),
});
