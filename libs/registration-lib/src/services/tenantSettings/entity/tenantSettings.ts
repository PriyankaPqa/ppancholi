import { IHttpClient, IHttpMock } from '@libs/core-lib//services/http-client';
import applicationInsights from '@libs/core-lib/plugins/applicationInsights/applicationInsights';
import { DomainBaseService } from '@libs/core-lib/services/base';
import {
  IBrandingEntityData,
  ICreateTenantSettingsRequest,
  IEditColoursRequest,
  IEditTenantDetailsRequest,
  IFeatureEntity,
  ISetDomainsRequest,
  ITenantSettingsEntity,
  ITenantSettingsEntityData,
  IValidateCaptchaAllowedIpAddressResponse,
} from '../../../entities/tenantSettings';
import { ITenantSettingsService } from './tenantSettings.types';

const API_URL_SUFFIX = 'system-management';
const ENTITY = 'tenant-settings';
const USER_TENANT_CONTROLLER = 'tenants';

export class TenantSettingsService extends DomainBaseService<ITenantSettingsEntity, never> implements ITenantSettingsService {
  constructor(http: IHttpClient | IHttpMock) {
    super(http, API_URL_SUFFIX, ENTITY);
  }

  async getAll(): Promise<ITenantSettingsEntityData[]> {
    return this.http.get(`${this.baseApi}/tenants/settings`, { globalHandler: false });
  }

  async getCurrentTenantSettings(): Promise<ITenantSettingsEntityData> {
    return this.http.get(`${this.baseUrl}/current-tenant-settings`, { globalHandler: false });
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
    return this.http.get(`${this.baseApi}/${USER_TENANT_CONTROLLER}/brandings`, { globalHandler: false });
  }

  async updateColours(payload: IEditColoursRequest): Promise<ITenantSettingsEntityData> {
    return this.http.patch(`${this.baseUrl}/colours`, payload);
  }

  async updateTenantDetails(payload: IEditTenantDetailsRequest): Promise<ITenantSettingsEntityData> {
    return this.http.patch(`${this.baseUrl}/tenant-details`, payload);
  }

  async getLogoUrl(languageCode: string): Promise<string> {
    const response = await this.http
      .getFullResponse<BlobPart>(`${this.baseUrl}/logo/${languageCode}`, { responseType: 'blob', globalHandler: false })
      .catch((e) => {
        applicationInsights.trackException(e, {}, 'tenantSettings', 'getLogoUrl');
        return null;
      });

    if (!response?.data) {
      return null;
    }

    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const url = window.URL.createObjectURL(blob);
    return url;
  }
}
