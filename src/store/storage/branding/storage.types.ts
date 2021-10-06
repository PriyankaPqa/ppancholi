import {
  IBrandingEntity, IEditColoursRequest, IEditTenantDetailsRequest,
} from '@/entities/branding';
import {
  IBaseActions, IBaseActionsMock, IBaseGetters, IBaseGettersMock, IBaseMutations, IBaseMutationsMock,
} from '../base';

export interface IGetters extends IBaseGetters<IBrandingEntity, never> {
  branding(): IBrandingEntity;
  logoUrl(languageCode: string): string;
}

export interface IGettersMock extends IBaseGettersMock<IBrandingEntity, never> {
  branding: jest.Mock<IBrandingEntity>;
  logoUrl: jest.Mock<string>;
}

export interface IActions extends IBaseActions<IBrandingEntity, never, uuid> {
  getBranding(): Promise<IBrandingEntity>;
  updateColours(payload: IEditColoursRequest): Promise<IBrandingEntity>;
  updateTenantDetails(payload: IEditTenantDetailsRequest): Promise<IBrandingEntity>;
  getLogoUrl(languageCode: string): Promise<string>;
}

export interface IActionsMock extends IBaseActionsMock<IBrandingEntity, never> {
  getBranding: jest.Mock<IBrandingEntity>;
  updateColours: jest.Mock<IBrandingEntity>;
  updateTenantDetails: jest.Mock<IBrandingEntity>;
  getLogoUrl: jest.Mock<string>;
}

export interface IMutations extends IBaseMutations<IBrandingEntity, never> {}

export interface IMutationsMock extends IBaseMutationsMock<IBrandingEntity, never> {}

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
