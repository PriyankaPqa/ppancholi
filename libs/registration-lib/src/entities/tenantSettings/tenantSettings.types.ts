import { IEntity, IEntityCombined } from '@libs/core-lib/entities/base';
import { IMultilingual } from '../../types';

export enum FeatureKeys {
  MassAction = 'mass-action',
  AddressAutoFill = 'AddressAutoFill',
  BotProtection = 'BotProtection',
}

export enum FeatureType {
  Temporary = 0,
  Permanent = 1,
}

export interface ITenantDetailsEntityData {
  name: IMultilingual;
  description: IMultilingual;
  hideName: boolean;
}

export interface ITenantDetailsEntity {
  name: IMultilingual;
  description: IMultilingual;
  showName?: boolean; // it's named "hideName" in Backend, but in Frontend it's a checkbox allowing user to SHOW name in the app header
}

export interface IColoursEntity {
  primary?: string;
  primaryLight?: string;
  primaryDark?: string;
  secondary?: string;
}

export interface IBrandingEntityData extends ITenantDetailsEntityData, IEntity {
  colours: IColoursEntity;
}

export interface IBrandingEntity extends ITenantDetailsEntity, IEntity {
  colours: IColoursEntity;
}

export interface IEditColoursRequest {
  colours: IColoursEntity;
}

export interface IEditTenantDetailsRequest extends ITenantDetailsEntityData {}

export type IBrandingCombined = IEntityCombined<IBrandingEntity, never>;
export interface IFeatureEntity extends IEntity {
  name: IMultilingual;
  description: IMultilingual;
  key: string;
  enabled: boolean;
  type: FeatureType;
}
export interface ITenantSettingsEntityData extends IEntity {
  slug: string;
  emisDomain: IMultilingual;
  registrationDomain: IMultilingual;
  availableLanguages: Array<string>;
  features: Array<IFeatureEntity>;
  branding: IBrandingEntityData;
}

export interface ITenantSettingsEntity extends IEntity {
  slug: string;
  emisDomain: IMultilingual;
  registrationDomain: IMultilingual;
  availableLanguages: Array<string>;
  features: Array<IFeatureEntity>;
  branding: IBrandingEntity;
}

export interface ISetDomainsRequest {
  emis: IMultilingual;
  registration: IMultilingual;
}

export interface ICreateTenantSettingsRequest {
  slug: string;
}

export interface IValidateCaptchaAllowedIpAddressResponse {
  ipAddressIsAllowed: boolean;
  clientIpAddress: string;
}

export type ITenantSettingsCombined = IEntityCombined<ITenantSettingsEntity, never>;
