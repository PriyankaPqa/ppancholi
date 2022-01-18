import {
  FeatureType,
  FeatureKeys,
  IFeatureEntity,
  ITenantSettingsEntity,
  ITenantSettingsEntityData,
} from './tenantSettings.types';

export const mockFeatures = (): IFeatureEntity[] => [{
  id: 'id-1',

  tenantId: 'tenant id-1',

  name: {
    translation: {
      en: 'feature name-1 en',
      fr: 'feature name-1 fr',
    },
  },

  description: {
    translation: {
      en: 'description-1 en',
      fr: 'description-1 fr',
    },
  },

  key: FeatureKeys.AddressAutoFill,

  enabled: false,

  type: FeatureType.Temporary,
}, {
  id: 'id-2',

  tenantId: 'tenant id-2',

  name: {
    translation: {
      en: 'feature name-2 en',
      fr: 'feature name-2 fr',
    },
  },

  description: {
    translation: {
      en: 'description-2 en',
      fr: 'description-2 fr',
    },
  },

  key: FeatureKeys.BotProtection,

  enabled: false,

  type: FeatureType.Permanent,
}];

export const mockTenantSettingsEntityData = (force?: Partial<ITenantSettingsEntityData>): ITenantSettingsEntityData => ({
  id: 'id',
  slug: 'slug',
  emisDomain: {
    translation: {
      en: 'emis domain en',
      fr: 'emis domain fr',
    },
  },
  registrationDomain: {
    translation: {
      en: 'registration domain en',
      fr: 'registration domain fr',
    },
  },
  availableLanguages: ['en', 'fr'],

  features: mockFeatures(),
  ...force,
});

export const mockTenantSettingsEntity = (force?: Partial<ITenantSettingsEntity>): ITenantSettingsEntity => ({
  ...mockTenantSettingsEntityData(),

  ...force,
});
