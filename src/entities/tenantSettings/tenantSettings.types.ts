import { IMultilingual } from '@/types';

import { IEntity, IEntityCombined } from '@/entities/base/base.types';

export enum FeatureKeys {
  MassAction = 'mass-action',
}

export enum FeatureType {
    Temporary = 0,
    Permanent = 1
}

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
}

export interface ITenantSettingsEntity extends ITenantSettingsEntityData {}

export interface ISetDomainsRequest {
  emis: IMultilingual;
  registration: IMultilingual;
}

export interface ICreateTenantSettingsRequest {
  slug: string;
}

export type ITenantSettingsCombined = IEntityCombined<ITenantSettingsEntity, never>;
