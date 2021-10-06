import { IMultilingual } from '@/types';

import { IEntity, IEntityCombined } from '@/entities/base/base.types';

export interface ITenantDetailsEntityData {
  name: IMultilingual;
  description: IMultilingual;
  hideName: boolean;
}

export interface ITenantDetailsEntity {
  name: IMultilingual;
  description: IMultilingual;
  showName: boolean; // it's named "hideName" in Backend, but in Frontend it's a checkbox allowing user to SHOW name in the app header
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
