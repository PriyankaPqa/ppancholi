import {
  ICreateTenantSettingsRequest, ISetDomainsRequest, ITenantSettingsEntity, ITenantSettingsEntityData,
} from '@/entities/tenantSettings';
import { DomainBaseService } from '@/services/base';
import { IHttpClient } from '@/services/httpClient';
import { ITenantSettingsService } from './tenantSettings.types';

const API_URL_SUFFIX = 'system-management';
const ENTITY = 'tenant-settings';

export class TenantSettingsService extends DomainBaseService<ITenantSettingsEntity, uuid> implements ITenantSettingsService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }

  async getAll(): Promise<ITenantSettingsEntityData[]> {
    return this.http.get(`${this.baseApi}/tenants/settings`);
  }

  async getCurrentTenantSettings(): Promise<ITenantSettingsEntityData> {
    return this.http.get(`${this.baseUrl}/current-tenant-settings`, { globalHandler: false });
  }

  async createTenantSettings(payload: ICreateTenantSettingsRequest): Promise<ITenantSettingsEntityData> {
    return this.http.post(`${this.baseUrl}`, payload);
  }

  async createTenantDomains(payload: ISetDomainsRequest): Promise<ITenantSettingsEntityData> {
    return this.http.patch(`${this.baseUrl}/domains`, payload);
  }
}
