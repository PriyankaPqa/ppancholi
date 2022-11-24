import { IMultilingual } from '@libs/shared-lib/types/interfaces/IMultilingual';

import { IEntity, IEntityCombined } from '../base';

export enum FeatureKeys {
  AddressAutoFill = 'AddressAutoFill',
  TeamImprovements = 'teamsImprovements',
  Assessments = 'Assessments',
  ApprovalsWithinEvent = 'Approvals',
  BotProtection = 'BotProtection',
  AssessmentsWithinCasefiles = 'AssessmentsWithinCasefiles',
  FinancialAssistanceDataCorrection = 'FinancialAssistanceDataCorrection',
  ActionApprovals = 'ActionApprovals',
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
  canEnable: boolean;
  canDisable: boolean;
  type: FeatureType;
}
export interface ITenantSettingsEntityData extends IEntity {
  slug: string;
  emisDomain: IMultilingual;
  registrationDomain: IMultilingual;
  availableLanguages: Array<string>;
  features: Array<IFeatureEntity>;
  branding: IBrandingEntityData;
  supportEmails: IMultilingual;
}

export interface ITenantSettingsEntity extends IEntity {
  slug: string;
  emisDomain: IMultilingual;
  registrationDomain: IMultilingual;
  availableLanguages: Array<string>;
  features: Array<IFeatureEntity>;
  branding: IBrandingEntity;
  supportEmails: IMultilingual;
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
