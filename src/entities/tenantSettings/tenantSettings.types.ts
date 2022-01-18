import { IMultilingual } from '../../types';

export enum FeatureKeys {
  MassAction = 'mass-action',
  AddressAutoFill = 'AddressAutoFill',
  BotProtection = 'BotProtection',
}

export enum FeatureType {
    Temporary = 0,
    Permanent = 1
}

export interface IFeatureEntity {
  id: uuid;
  tenantId: uuid;
  name: IMultilingual;
  description: IMultilingual;
  key: FeatureKeys;
  enabled: boolean;
  type: FeatureType;
}
export interface ITenantSettingsEntityData{
  id: uuid;
  slug: string;
  emisDomain: IMultilingual;
  registrationDomain: IMultilingual;
  availableLanguages: Array<string>;
  features: Array<IFeatureEntity>;
}

export interface ITenantSettingsEntity extends ITenantSettingsEntityData {}

export interface ISetDomainsRequest {
  emis: IMultilingual;
  registration: IMultilingual;
}

export interface ICreateTenantSettingsRequest {
  slug: string;
}
