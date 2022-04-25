import {
  FeatureKeys,
  IBrandingEntity,
  ICreateTenantSettingsRequest, IEditColoursRequest, IEditTenantDetailsRequest, ISetDomainsRequest, ITenantSettingsEntity, ITenantSettingsEntityData,
} from '@/entities/tenantSettings';
import { IMultilingual } from '@libs/registration-lib/types';
import {
  IBaseActions, IBaseActionsMock, IBaseGetters, IBaseGettersMock, IBaseMutations, IBaseMutationsMock,
} from '../base';

export interface IGetters extends IBaseGetters<ITenantSettingsEntity, never> {
  currentTenantSettings(): ITenantSettingsEntity;
  isFeatureEnabled(featureKe: FeatureKeys): boolean;
  logoUrl(languageCode: string): string;
}

export interface IGettersMock extends IBaseGettersMock<ITenantSettingsEntity, never> {
  currentTenantSettings: jest.Mock<ITenantSettingsEntity>;
  isFeatureEnabled: jest.Mock<boolean>;
  logoUrl: jest.Mock<string>;
}

export interface IActions extends IBaseActions<ITenantSettingsEntity, never, uuid> {
  fetchCurrentTenantSettings(): Promise<ITenantSettingsEntityData>;
  createTenantSettings(payload: ICreateTenantSettingsRequest): Promise<ITenantSettingsEntityData>;
  createTenantDomains(payload: ISetDomainsRequest): Promise<ITenantSettingsEntityData>;
  enableFeature(featureId: uuid): Promise<ITenantSettingsEntityData>;
  disableFeature(featureId: uuid): Promise<ITenantSettingsEntityData>;
  fetchUserTenants(): Promise<IBrandingEntity[]>;
  updateColours(payload: IEditColoursRequest): Promise<ITenantSettingsEntity>;
  updateTenantDetails(payload: IEditTenantDetailsRequest): Promise<ITenantSettingsEntity>;
  updateSupportEmails(payload: IMultilingual): Promise<ITenantSettingsEntity>;
  fetchLogoUrl(languageCode: string): Promise<string>;
}

export interface IActionsMock extends IBaseActionsMock<ITenantSettingsEntity, never> {
  fetchCurrentTenantSettings: jest.Mock<ITenantSettingsEntityData>;
  createTenantSettings: jest.Mock<ITenantSettingsEntityData>;
  createTenantDomains: jest.Mock<ITenantSettingsEntityData>;
  enableFeature: jest.Mock<ITenantSettingsEntityData>;
  disableFeature: jest.Mock<ITenantSettingsEntityData>;
  fetchUserTenants: jest.Mock<IBrandingEntity[]>;
  updateColours: jest.Mock<ITenantSettingsEntity>;
  updateTenantDetails: jest.Mock<ITenantSettingsEntity>;
  updateSupportEmails: jest.Mock<ITenantSettingsEntity>;
  fetchLogoUrl: jest.Mock<string>;
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
