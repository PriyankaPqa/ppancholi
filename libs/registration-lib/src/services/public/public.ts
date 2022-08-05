/* eslint-disable no-empty */
import { IHttpClient } from '@libs/core-lib/services/http-client';
import applicationInsights from '@libs/core-lib/plugins/applicationInsights/applicationInsights';
import { IAzureSearchResult } from '@libs/core-lib/types';
import { IEventData } from '../../../../entities-lib/src/registration-event';
import { IPublicService } from './public.types';

export class PublicService implements IPublicService {
  constructor(private readonly http: IHttpClient) {}

  async searchEvents(lang: string, registrationLink: string): Promise<IAzureSearchResult<IEventData>> {
    return this.http.get<IAzureSearchResult<IEventData>>('/event/public/search/events', {
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
}
