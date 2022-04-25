import { IEntity, mockBaseData } from '@/entities/base';
import {
  FeatureType,
  IBrandingEntity,
  IBrandingEntityData,
  ICreateTenantSettingsRequest,
  IEditColoursRequest,
  IEditTenantDetailsRequest,
  IFeatureEntity,
  ISetDomainsRequest,
  ITenantSettingsCombined,
  ITenantSettingsEntity,
  ITenantSettingsEntityData,
} from './tenantSettings.types';

export const mockEditColoursRequest = (): IEditColoursRequest => ({
  colours: {
    primary: '#007DA3',
    primaryLight: '#A7D0E1',
    primaryDark: '#005670',
    secondary: '#EE0000',
  },
});

export const mockEditTenantDetailsRequest = (): IEditTenantDetailsRequest => ({
  name: {
    translation: {
      en: 'name en',
      fr: 'name fr',
    },
  },
  description: {
    translation: {
      en: 'description en',
      fr: 'description fr',
    },
  },
  hideName: false,
});

export const mockBrandingEntityData = (force?: Partial<IBrandingEntityData>): IBrandingEntityData => ({
  ...mockBaseData(),

  ...mockEditColoursRequest(),

  ...mockEditTenantDetailsRequest(),

  ...force,
});

export const mockBrandingEntity = (force?: Partial<IBrandingEntity>): IBrandingEntity => ({
  ...mockBrandingEntityData(),

  showName: true,

  ...force,
});

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

  branding: mockBrandingEntityData(),

  supportEmails: {
    translation: {
      en: 'support_en@redcross.ca',
      fr: 'support_fr@redcross.ca',
    },
  },

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

  branding: mockBrandingEntity(),

  ...force,
});

export const mockCombinedTenantSettings = (force?: Partial<IEntity>): ITenantSettingsCombined => ({
  metadata: null as never,
  entity: mockTenantSettingsEntity(force),
});
