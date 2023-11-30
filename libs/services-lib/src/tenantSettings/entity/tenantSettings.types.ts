import {
  IBrandingEntityData,
  IConsentStatement,
  ICreateTenantSettingsRequest,
  IEditColoursRequest,
  IEditTenantDetailsRequest,
  IFeatureEntity,
  ISetDomainsRequest,
  ITenantSettingsEntity,
  ITenantSettingsEntityData,
  IValidateCaptchaAllowedIpAddressResponse,
  IEditFeatureRequest,
  ICanEnableFeatureRequest,
  ICanDisableFeatureRequest,
  ICreateFeatureRequest,
  IRemoveFeatureRequest,
  ISetFeatureEnabledRequest,
} from '@libs/entities-lib/tenantSettings';
import { IMultilingual } from '@libs/shared-lib/types';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface ITenantSettingsService extends IDomainBaseService<ITenantSettingsEntity, uuid> {
  getAllTenants(): Promise<ITenantSettingsEntityData[]>;
  getCurrentTenantSettings(): Promise<ITenantSettingsEntityData>;
  getPublicFeatures(): Promise<IFeatureEntity[]>;
  getBranding(): Promise<IBrandingEntityData>;
  getConsentStatement(eventId: uuid): Promise<IConsentStatement>;
  createTenantSettings(payload: ICreateTenantSettingsRequest): Promise<ITenantSettingsEntityData>;
  createTenantDomains(payload: ISetDomainsRequest): Promise<ITenantSettingsEntityData>;
  enableFeature(featureId: uuid): Promise<ITenantSettingsEntityData>;
  disableFeature(featureId: uuid): Promise<ITenantSettingsEntityData>;
  setFeatureEnabled(payload: ISetFeatureEnabledRequest): Promise<ITenantSettingsEntityData[]>;
  getUserTenants(): Promise<IBrandingEntityData[]>;
  updateColours(payload: IEditColoursRequest): Promise<ITenantSettingsEntityData>;
  updateTenantDetails(payload: IEditTenantDetailsRequest): Promise<ITenantSettingsEntityData>;
  updateSupportEmails(payload: IMultilingual): Promise<ITenantSettingsEntityData>;
  getLogoUrl(languageCode: string, tenantId?: string): string;
  validateCaptchaAllowedIpAddress(): Promise<IValidateCaptchaAllowedIpAddressResponse>;
  createFeature(payload: ICreateFeatureRequest): Promise<ITenantSettingsEntityData[]>;
  removeFeature(payload: IRemoveFeatureRequest): Promise<ITenantSettingsEntityData[]>;
  editFeature(payload: IEditFeatureRequest): Promise<ITenantSettingsEntityData>;
  canEnableFeature(payload: ICanEnableFeatureRequest): Promise<ITenantSettingsEntityData[]>;
  canDisableFeature(payload: ICanDisableFeatureRequest): Promise<ITenantSettingsEntityData[]>;
}

export interface ITenantSettingsServiceMock extends IDomainBaseServiceMock<ITenantSettingsEntity> {
  getAllTenants: jest.Mock<ITenantSettingsEntityData[]>;
  getCurrentTenantSettings: jest.Mock<ITenantSettingsEntityData>;
  getPublicFeatures: jest.Mock<IFeatureEntity[]>;
  getBranding: jest.Mock<IBrandingEntityData>;
  getConsentStatement: jest.Mock<IConsentStatement>;
  createTenantSettings: jest.Mock<ITenantSettingsEntityData>;
  createTenantDomains: jest.Mock<ITenantSettingsEntityData>;
  enableFeature: jest.Mock<ITenantSettingsEntityData>;
  disableFeature: jest.Mock<ITenantSettingsEntityData>;
  setFeatureEnabled: jest.Mock<ITenantSettingsEntityData[]>;
  getUserTenants: jest.Mock<IBrandingEntityData[]>;
  updateColours: jest.Mock<ITenantSettingsEntityData>;
  updateTenantDetails: jest.Mock<ITenantSettingsEntityData>;
  updateSupportEmails: jest.Mock<ITenantSettingsEntityData>;
  getLogoUrl: jest.Mock<string>;
  validateCaptchaAllowedIpAddress: jest.Mock<IValidateCaptchaAllowedIpAddressResponse>;
  createFeature: jest.Mock<ITenantSettingsEntityData[]>;
  removeFeature: jest.Mock<ITenantSettingsEntityData[]>;
  editFeature: jest.Mock<ITenantSettingsEntityData>;
  canEnableFeature: jest.Mock<ITenantSettingsEntityData[]>;
  canDisableFeature: jest.Mock<ITenantSettingsEntityData[]>;
}
