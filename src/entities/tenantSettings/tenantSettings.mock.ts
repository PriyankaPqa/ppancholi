import { IEntity, mockBaseData } from '@/entities/base';
import {
  ICreateTenantSettingsRequest,
  ISetDomainsRequest,
  ITenantSettingsCombined,
  ITenantSettingsEntity,
  ITenantSettingsEntityData,
} from './tenantSettings.types';

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
