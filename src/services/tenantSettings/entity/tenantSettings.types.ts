import {
  ICreateTenantSettingsRequest, ISetDomainsRequest, ITenantSettingsEntity, ITenantSettingsEntityData,
} from '@/entities/tenantSettings';
import { IDomainBaseService, IDomainBaseServiceMock } from '@/services/base';

export interface ITenantSettingsService extends IDomainBaseService<ITenantSettingsEntity, uuid> {
  getCurrentTenantSettings(): Promise<ITenantSettingsEntityData>;
  createTenantSettings(payload: ICreateTenantSettingsRequest): Promise<ITenantSettingsEntityData>;
  createTenantDomains(payload: ISetDomainsRequest): Promise<ITenantSettingsEntityData>;
}

export interface ITenantSettingsServiceMock extends IDomainBaseServiceMock<ITenantSettingsEntity> {
  getCurrentTenantSettings: jest.Mock<ITenantSettingsEntityData>;
  createTenantSettings: jest.Mock<ITenantSettingsEntityData>;
  createTenantDomains: jest.Mock<ITenantSettingsEntityData>;
}
