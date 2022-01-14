/* eslint-disable no-empty */
import { IAzureSearchResult } from '@/types';
import { IHttpClient } from '../httpClient';
import applicationInsights from '../../plugins/applicationInsights/applicationInsights';
import { IEventData } from '../../entities/event';
import { IPublicService } from './public.types';
import { IFeatureEntity } from '../../entities/tenantSettings';

export class PublicService implements IPublicService {
  constructor(private readonly http: IHttpClient) {}

  async searchEvents(lang: string, registrationLink: string): Promise<IAzureSearchResult<IEventData>> {
    return this.http.get<IAzureSearchResult<IEventData>>('/public-search/beneficiary-event', {
      params: {
        language: lang,
        registrationLink,
      },
      containsEncodedURL: true,
      ignoreJwt: true,
    });
  }

  async getTenantByEmisDomain(domain: string): Promise<string> {
    let tenantId = null;
    try {
      tenantId = await this.http.get<string>(`/system-management/tenants/id-from-domain?domain=${domain}`,
        { globalHandler: false, noErrorLogging: true, ignoreJwt: true });
    } catch (e) {
      // allow to fail silently - probably dev...
      applicationInsights.trackTrace('PublicService.getTenantByEmisDomain', { error: e }, 'public', 'getTenantByEmisDomain');
    }
    return tenantId;
  }

  async getTenantByRegistrationDomain(domain: string): Promise<string> {
    let tenantId = null;
    try {
      tenantId = await this.http.get<string>(`/system-management/tenants/id-from-registration-domain?registrationDomain=${domain}`,
        { globalHandler: false, noErrorLogging: true, ignoreJwt: true });
    } catch (e) {
      // allow to fail silently - probably dev...
      applicationInsights.trackTrace('PublicService.getTenantByRegistrationDomain', { error: e }, 'public', 'getTenantByRegistrationDomain');
    }
    return tenantId;
  }

  async getPublicFeatures(): Promise<IFeatureEntity[]> {
    let features = null;
    try {
      features = await this.http.get<IFeatureEntity[]>('/system-management/tenant-settings/public-features',
        { globalHandler: false, noErrorLogging: true, ignoreJwt: true });
    } catch (e) {
      // allow to fail silently - probably dev...
      applicationInsights.trackTrace('PublicService.getPublicFeatures', { error: e }, 'public', 'getPublicFeatures');
    }
    return features;
  }
}
