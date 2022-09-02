import {
  IBrandingEntityData,
  ICreateTenantSettingsRequest,
  IEditColoursRequest,
  IEditTenantDetailsRequest, IFeatureEntity,
  ISetDomainsRequest,
  ITenantSettingsEntity,
  ITenantSettingsEntityData, IValidateCaptchaAllowedIpAddressResponse,
} from '@libs/entities-lib/tenantSettings';
import { IMultilingual } from '@libs/shared-lib/types';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface ITenantSettingsService extends IDomainBaseService<ITenantSettingsEntity, uuid> {
  getCurrentTenantSettings(): Promise<ITenantSettingsEntityData>;
  getPublicFeatures(): Promise<IFeatureEntity[]>;
  getBranding(): Promise<IBrandingEntityData>;
  createTenantSettings(payload: ICreateTenantSettingsRequest): Promise<ITenantSettingsEntityData>;
  createTenantDomains(payload: ISetDomainsRequest): Promise<ITenantSettingsEntityData>;
  enableFeature(featureId: uuid): Promise<ITenantSettingsEntityData>;
  disableFeature(featureId: uuid): Promise<ITenantSettingsEntityData>;
  getUserTenants(): Promise<IBrandingEntityData[]>;
  updateColours(payload: IEditColoursRequest): Promise<ITenantSettingsEntityData>;
  updateTenantDetails(payload: IEditTenantDetailsRequest): Promise<ITenantSettingsEntityData>;
  updateSupportEmails(payload: IMultilingual): Promise<ITenantSettingsEntityData>;
  getLogoUrl(languageCode: string, tenantId?: string): string;
  validateCaptchaAllowedIpAddress(): Promise<IValidateCaptchaAllowedIpAddressResponse>;
}

export interface ITenantSettingsServiceMock extends IDomainBaseServiceMock<ITenantSettingsEntity> {
  getCurrentTenantSettings: jest.Mock<ITenantSettingsEntityData>;
  getPublicFeatures: jest.Mock<IFeatureEntity[]>;
  getBranding: jest.Mock<IBrandingEntityData>;
  createTenantSettings: jest.Mock<ITenantSettingsEntityData>;
  createTenantDomains: jest.Mock<ITenantSettingsEntityData>;
  enableFeature: jest.Mock<ITenantSettingsEntityData>;
  disableFeature: jest.Mock<ITenantSettingsEntityData>;
  getUserTenants: jest.Mock<IBrandingEntityData[]>;
  updateColours: jest.Mock<ITenantSettingsEntityData>;
  updateTenantDetails: jest.Mock<ITenantSettingsEntityData>;
  updateSupportEmails: jest.Mock<ITenantSettingsEntityData>;
  getLogoUrl: jest.Mock<string>;
  validateCaptchaAllowedIpAddress: jest.Mock<IValidateCaptchaAllowedIpAddressResponse>;
}
