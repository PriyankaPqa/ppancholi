import {
  IBrandingEntityData, IConsentStatement, ICreateTenantSettingsRequest, IEditColoursRequest, IEditTenantDetailsRequest, IFeatureEntity,
  ISetDomainsRequest, ITenantSettingsEntity, ITenantSettingsEntityData, IValidateCaptchaAllowedIpAddressResponse,
} from '@libs/entities-lib/tenantSettings';
import { IMultilingual } from '@libs/shared-lib/types';
import { GlobalHandler, IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';
import { ITenantSettingsService } from './tenantSettings.types';

const API_URL_SUFFIX = 'system-management';
const ENTITY = 'tenant-settings';
const USER_TENANT_CONTROLLER = 'tenants';

export class TenantSettingsService extends DomainBaseService<ITenantSettingsEntity, uuid> implements ITenantSettingsService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }

  async getAll(): Promise<ITenantSettingsEntityData[]> {
    return this.http.get(`${this.baseApi}/tenants/settings`, { globalHandler: GlobalHandler.Partial });
  }

  async getCurrentTenantSettings(): Promise<ITenantSettingsEntityData> {
    return this.http.get<ITenantSettingsEntityData>(`${this.baseUrl}/current-tenant-settings`, { globalHandler: GlobalHandler.Partial })
      .then((t) => {
        if (t?.tenantId) {
          this.http.setHeadersTenant(t.tenantId);
        }
        return t;
      });
  }

  async createTenantSettings(payload: ICreateTenantSettingsRequest): Promise<ITenantSettingsEntityData> {
    return this.http.post(`${this.baseUrl}`, payload);
  }

  async createTenantDomains(payload: ISetDomainsRequest): Promise<ITenantSettingsEntityData> {
    return this.http.patch(`${this.baseUrl}/domains`, payload);
  }

  async enableFeature(featureId: string): Promise<ITenantSettingsEntityData> {
    return this.http.patch(`${this.baseUrl}/feature/${featureId}/enable`);
  }

  async disableFeature(featureId: string): Promise<ITenantSettingsEntityData> {
    return this.http.patch(`${this.baseUrl}/feature/${featureId}/disable`);
  }

  async getUserTenants(): Promise<IBrandingEntityData[]> {
    return this.http.get(`${this.baseApi}/${USER_TENANT_CONTROLLER}/brandings`, { globalHandler: GlobalHandler.Partial });
  }

  async updateColours(payload: IEditColoursRequest): Promise<ITenantSettingsEntityData> {
    return this.http.patch(`${this.baseUrl}/colours`, payload);
  }

  async updateTenantDetails(payload: IEditTenantDetailsRequest): Promise<ITenantSettingsEntityData> {
    return this.http.patch(`${this.baseUrl}/tenant-details`, payload);
  }

  async updateSupportEmails(payload: IMultilingual): Promise<ITenantSettingsEntityData> {
    return this.http.patch(`${this.baseUrl}/support-emails`, { supportEmails: payload });
  }

  getLogoUrl(languageCode: string, tenantId?: string): string {
    return `${this.baseUrl}/${tenantId || this.http.getTenant()}/logo/${languageCode}`;
  }

  async getPublicFeatures(): Promise<IFeatureEntity[]> {
    return this.http.get(`${this.baseUrl}/public-features`);
  }

  async validateCaptchaAllowedIpAddress(): Promise<IValidateCaptchaAllowedIpAddressResponse> {
    return this.http.get(`${this.baseUrl}/validate-captcha-allowed-ip-address`);
  }

  async getBranding(): Promise<IBrandingEntityData> {
    return this.http.get(`${this.baseUrl}/current-branding`);
  }

  async getConsentStatement(eventId: string): Promise<IConsentStatement> {
    return this.http.get(`${this.baseUrl}/consent-statements/${eventId}`);
  }
}
