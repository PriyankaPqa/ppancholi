import {
  IBrandingEntityData,
  ICreateTenantSettingsRequest,
  IEditColoursRequest,
  IEditTenantDetailsRequest,
  ISetDomainsRequest,
  ITenantSettingsEntity,
  ITenantSettingsEntityData,
} from '@/entities/tenantSettings';
import { IDomainBaseService, IDomainBaseServiceMock } from '@libs/core-lib/services/base';
import { IMultilingual } from '@libs/registration-lib/types';

export interface ITenantSettingsService extends IDomainBaseService<ITenantSettingsEntity, uuid> {
  getCurrentTenantSettings(): Promise<ITenantSettingsEntityData>;
  createTenantSettings(payload: ICreateTenantSettingsRequest): Promise<ITenantSettingsEntityData>;
  createTenantDomains(payload: ISetDomainsRequest): Promise<ITenantSettingsEntityData>;
  enableFeature(featureId: uuid): Promise<ITenantSettingsEntityData>;
  disableFeature(featureId: uuid): Promise<ITenantSettingsEntityData>;
  getUserTenants(): Promise<IBrandingEntityData[]>;
  updateColours(payload: IEditColoursRequest): Promise<ITenantSettingsEntityData>;
  updateTenantDetails(payload: IEditTenantDetailsRequest): Promise<ITenantSettingsEntityData>;
  updateSupportEmails(payload: IMultilingual): Promise<ITenantSettingsEntityData>;
  getLogoUrl(languageCode: string): Promise<string>;
}

export interface ITenantSettingsServiceMock extends IDomainBaseServiceMock<ITenantSettingsEntity> {
  getCurrentTenantSettings: jest.Mock<ITenantSettingsEntityData>;
  createTenantSettings: jest.Mock<ITenantSettingsEntityData>;
  createTenantDomains: jest.Mock<ITenantSettingsEntityData>;
  enableFeature: jest.Mock<ITenantSettingsEntityData>;
  disableFeature: jest.Mock<ITenantSettingsEntityData>;
  getUserTenants: jest.Mock<IBrandingEntityData[]>;
  updateColours: jest.Mock<ITenantSettingsEntityData>;
  updateTenantDetails: jest.Mock<ITenantSettingsEntityData>;
  updateSupportEmails: jest.Mock<ITenantSettingsEntityData>;
  getLogoUrl: jest.Mock<string>;

}
