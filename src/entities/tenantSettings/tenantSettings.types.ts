import { IMultilingual } from '@/types';

import { IEntity, IEntityCombined } from '@/entities/base/base.types';

export interface ITenantSettingsEntityData extends IEntity {
  slug: string;
  emisDomain: IMultilingual;
  registrationDomain: IMultilingual;
  availableLanguages: Array<string>
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
