import { IMultilingual } from '@libs/shared-lib/types/interfaces/IMultilingual';

import { IEntity } from '../base';

export enum FeatureKeys {
  AddressAutoFill = 'AddressAutoFill',
  BotProtection = 'BotProtection',
  SelfRegistration = 'SelfRegistration',
  UseIdentityServer = 'UseIdentityServer',
  TaskManagement = 'TaskManagement',
  DisplayNotificationCenter = 'DisplayNotificationCenter',
  DataCorrectionPhaseII = 'DataCorrectionPhaseII',
  FeatureDashboard = 'FeatureDashboard',
  AppointmentBooking = 'AppointmentBooking',
  Lodging = 'Lodging',
  NoReloadOnNewVersion = 'NoReloadOnNewVersion',
  MovePayments = 'MovePayments',
  CaseFileIndividual = 'CaseFileIndividual',
}

export enum FeatureType {
  Temporary = 0,
  Permanent = 1,
}

export enum FeatureVisibility {
  Private = 1,
  Public = 2,
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

export interface IFeatureEntity extends IEntity {
  name: IMultilingual;
  description: IMultilingual;
  key: string;
  enabled: boolean;
  canEnable: boolean;
  canDisable: boolean;
  type: FeatureType;
  visibility: FeatureVisibility;
}

export interface IConsentStatementData {
  id: uuid;
  name: IMultilingual;
  statement: IMultilingual;
}

export interface IConsentStatement extends IEntity, IConsentStatementData {
}

export interface ITenantSettingsEntityData extends IEntity {
  consentStatements?: Array<IConsentStatement>;
  slug: string;
  emisDomain: IMultilingual;
  registrationDomain: IMultilingual;
  availableLanguages: Array<string>;
  features: Array<IFeatureEntity>;
  branding: IBrandingEntityData;
  supportEmails: IMultilingual;
}

export interface ITenantSettingsEntity extends IEntity {
  consentStatements?: Array<IConsentStatement>;
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

export interface IMultiTenantFeatureRequest {
  key: string;
  tenantIds: uuid[];
}

export interface ICreateFeatureRequest extends IMultiTenantFeatureRequest {
  name: IMultilingual;
  description: IMultilingual;
  type: FeatureType;
}

export interface IRemoveFeatureRequest extends IMultiTenantFeatureRequest {
  key: string;
}

export interface IEditFeatureRequest {
  tenantId: uuid;
  id: uuid;
  name: IMultilingual;
  description: IMultilingual;
  type: FeatureType;
  key: string;
  enabled: boolean;
  canEnable: boolean;
  canDisable: boolean;
  visibility: FeatureVisibility;
}

export interface ISetFeatureEnabledRequest extends IMultiTenantFeatureRequest {
  enabled: boolean;
}

export interface ICanEnableFeatureRequest extends IMultiTenantFeatureRequest {
  canEnable: boolean;
}

export interface ICanDisableFeatureRequest extends IMultiTenantFeatureRequest {
  canDisable: boolean;
}

export type IdParams = uuid;
