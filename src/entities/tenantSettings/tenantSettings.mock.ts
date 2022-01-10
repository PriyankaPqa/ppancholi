import { IEntity, mockBaseData } from '@/entities/base';
import {
  FeatureType,
  ICreateTenantSettingsRequest,
  IFeatureEntity,
  ISetDomainsRequest,
  ITenantSettingsCombined,
  ITenantSettingsEntity,
  ITenantSettingsEntityData,
} from './tenantSettings.types';

export const mockFeatures = (): IFeatureEntity[] => [{
  ...mockBaseData(),

  id: 'id-1',

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

  key: 'feature key-1',

  enabled: false,

  type: FeatureType.Temporary,
}, {
  ...mockBaseData(),

  id: 'id-2',

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

  key: 'feature key-2',

  enabled: false,

  type: FeatureType.Permanent,
}];

export const mockTenantSettingsEntityData = (force?: Partial<ITenantSettingsEntityData>): ITenantSettingsEntityData => ({
  ...mockBaseData(),

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

export const mockCreateTenantSettingsRequest = (): ICreateTenantSettingsRequest => ({
  slug: 'slug',
});

export const mockSetDomainsRequest = (): ISetDomainsRequest => ({
  emis: {
    translation: {
      en: 'emis domain en',
      fr: 'emis domain fr',
    },
  },
  registration: {
    translation: {
      en: 'registration domain en',
      fr: 'registration domain fr',
    },
  },
});

export const mockTenantSettingsEntity = (force?: Partial<ITenantSettingsEntity>): ITenantSettingsEntity => ({
  ...mockTenantSettingsEntityData(),

  ...force,
});

export const mockCombinedTenantSettings = (force?: Partial<IEntity>): ITenantSettingsCombined => ({
  metadata: null as never,
  entity: mockTenantSettingsEntity(force),
});
