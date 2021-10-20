import {
  ICreateTenantSettingsRequest, ISetDomainsRequest, ITenantSettingsEntity, ITenantSettingsEntityData,
} from '@/entities/tenantSettings';
import {
  IBaseActions, IBaseActionsMock, IBaseGetters, IBaseGettersMock, IBaseMutations, IBaseMutationsMock,
} from '../base';

export interface IGetters extends IBaseGetters<ITenantSettingsEntity, never> {
  currentTenantSettings(): ITenantSettingsEntity;
}

export interface IGettersMock extends IBaseGettersMock<ITenantSettingsEntity, never> {
  currentTenantSettings: jest.Mock<ITenantSettingsEntity>;
}

export interface IActions extends IBaseActions<ITenantSettingsEntity, never, uuid> {
  getCurrentTenantSettings(): Promise<ITenantSettingsEntityData>;
  createTenantSettings(payload: ICreateTenantSettingsRequest): Promise<ITenantSettingsEntityData>;
  createTenantDomains(payload: ISetDomainsRequest): Promise<ITenantSettingsEntityData>;
}

export interface IActionsMock extends IBaseActionsMock<ITenantSettingsEntity, never> {
  getCurrentTenantSettings: jest.Mock<ITenantSettingsEntityData>;
  createTenantSettings: jest.Mock<ITenantSettingsEntityData>;
  createTenantDomains: jest.Mock<ITenantSettingsEntityData>;
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
