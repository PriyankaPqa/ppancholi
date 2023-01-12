import {
  FeatureKeys,
  IBrandingEntity,
  IBrandingEntityData,
  ICreateTenantSettingsRequest, IEditColoursRequest, IEditTenantDetailsRequest,
  IFeatureEntity, ISetDomainsRequest,
  ITenantSettingsEntity,
  ITenantSettingsEntityData, IValidateCaptchaAllowedIpAddressResponse, IdParams,
} from '@libs/entities-lib/tenantSettings';
import { BaseActions, BaseGetters, BaseState } from '@/base';
import { IMultilingual } from '@libs/shared-lib/types';

export interface TenantSettingsState extends BaseState<ITenantSettingsEntity> {
  currentTenantSettings: ITenantSettingsEntity
  recaptcha: {
    ipAddressIsAllowed: boolean,
    clientIpAddress: string,
  }
}

export interface TenantSettingsGetters extends BaseGetters<ITenantSettingsEntity> {}

export interface TenantSettingsActions extends BaseActions<ITenantSettingsEntity, IdParams> {
  isFeatureEnabled: (featureKey: FeatureKeys) => boolean
  getBranding: () => IBrandingEntity
  setCurrentTenantSettings: (tenantSettingsData: ITenantSettingsEntityData) => IBrandingEntity
  setFeatures: (features: IFeatureEntity[]) => void
  setBranding: (brandingData: IBrandingEntityData) => void
  fetchCurrentTenantSettings: () => Promise<ITenantSettingsEntityData>
  createTenantSettings: (payload: ICreateTenantSettingsRequest) => Promise<ITenantSettingsEntityData>
  createTenantDomains: (payload: ISetDomainsRequest) => Promise<ITenantSettingsEntityData>
  enableFeature: (featureId: uuid) => Promise<ITenantSettingsEntityData>
  disableFeature: (featureId: uuid) => Promise<ITenantSettingsEntityData>
  fetchUserTenants: () => Promise<IBrandingEntity[]>
  updateColours: (payload: IEditColoursRequest) => Promise<ITenantSettingsEntity>
  updateTenantDetails: (payload: IEditTenantDetailsRequest) => Promise<ITenantSettingsEntity>
  fetchPublicFeatures: () => Promise<IFeatureEntity[]>
  validateCaptchaAllowedIpAddress: () => Promise<IValidateCaptchaAllowedIpAddressResponse>
  fetchBranding: () => Promise<IBrandingEntity>
  updateTheme: (branding: IBrandingEntity) => void;
  updateSupportEmails: (payload: IMultilingual) => Promise<ITenantSettingsEntity>
}

export interface TenantSettingsStore extends TenantSettingsState, TenantSettingsGetters, TenantSettingsActions {}
