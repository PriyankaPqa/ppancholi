import {
  FeatureKeys,
  IBrandingEntity,
  ICreateTenantSettingsRequest,
  IEditColoursRequest,
  IEditTenantDetailsRequest,
  IFeatureEntity,
  ISetDomainsRequest,
  ITenantSettingsEntity,
  ITenantSettingsEntityData,
  IValidateCaptchaAllowedIpAddressResponse,
} from '../../../entities/tenantSettings';
import {
  IBaseActions, IBaseActionsMock, IBaseGetters, IBaseGettersMock, IBaseMutations, IBaseMutationsMock,
} from '../base';

export interface IGetters extends IBaseGetters<ITenantSettingsEntity, never> {
  currentTenantSettings(): ITenantSettingsEntity;
  isFeatureEnabled(featureKe: FeatureKeys): boolean;
  branding(): IBrandingEntity;
  logoUrl(languageCode: string): string;
  validateCaptchaAllowedIpAddress(): IValidateCaptchaAllowedIpAddressResponse;
}

export interface IGettersMock extends IBaseGettersMock<ITenantSettingsEntity, never> {
  currentTenantSettings: jest.Mock<ITenantSettingsEntity>;
  branding(): IBrandingEntity;
  isFeatureEnabled: jest.Mock<boolean>;
  logoUrl: jest.Mock<string>;
  validateCaptchaAllowedIpAddress: jest.Mock<IValidateCaptchaAllowedIpAddressResponse>;
}

export interface IActions extends IBaseActions<ITenantSettingsEntity, never, uuid> {
  fetchCurrentTenantSettings(): Promise<ITenantSettingsEntityData>;
  fetchPublicFeatures(): Promise<IFeatureEntity[]>;
  fetchBranding(): Promise<IBrandingEntity>;
  createTenantSettings(payload: ICreateTenantSettingsRequest): Promise<ITenantSettingsEntityData>;
  createTenantDomains(payload: ISetDomainsRequest): Promise<ITenantSettingsEntityData>;
  enableFeature(featureId: uuid): Promise<ITenantSettingsEntityData>;
  disableFeature(featureId: uuid): Promise<ITenantSettingsEntityData>;
  fetchUserTenants(): Promise<IBrandingEntity[]>;
  updateColours(payload: IEditColoursRequest): Promise<ITenantSettingsEntity>;
  updateTenantDetails(payload: IEditTenantDetailsRequest): Promise<ITenantSettingsEntity>;
  fetchLogoUrl(languageCode: string): Promise<string>;
  validateCaptchaAllowedIpAddress(): Promise<IValidateCaptchaAllowedIpAddressResponse>;
}

export interface IActionsMock extends IBaseActionsMock<ITenantSettingsEntity, never> {
  fetchCurrentTenantSettings: jest.Mock<ITenantSettingsEntityData>;
  fetchPublicFeatures: jest.Mock<IFeatureEntity[]>;
  fetchBranding: jest.Mock<IBrandingEntity>;
  createTenantSettings: jest.Mock<ITenantSettingsEntityData>;
  createTenantDomains: jest.Mock<ITenantSettingsEntityData>;
  enableFeature: jest.Mock<ITenantSettingsEntityData>;
  disableFeature: jest.Mock<ITenantSettingsEntityData>;
  fetchUserTenants: jest.Mock<IBrandingEntity[]>;
  updateColours: jest.Mock<ITenantSettingsEntity>;
  updateTenantDetails: jest.Mock<ITenantSettingsEntity>;
  fetchLogoUrl: jest.Mock<string>;
  validateCaptchaAllowedIpAddress: jest.Mock<IValidateCaptchaAllowedIpAddressResponse>;
}

export interface IMutations extends IBaseMutations<ITenantSettingsEntity, never> {}

export interface IMutationsMock extends IBaseMutationsMock<ITenantSettingsEntity, never> {}

export interface IStorageMake {
  getters: IGetters;
  actions: IActions;
  mutations: IMutations;
}

export interface IStorageMakeMock {
  getters: IGettersMock;
  actions: IActionsMock;
  mutations: IMutationsMock;
}

export interface IStorage {
  make(): IStorageMake;
}

export interface IStorageMock {
  make(): IStorageMake;
}
