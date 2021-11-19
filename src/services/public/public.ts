/* eslint-disable no-empty */
import { IHttpClient } from '@/services/httpClient';
import { IAzureSearchResult } from '@/types';
import { IEventData } from '../../entities/event';
import { IPublicService } from './public.types';

export class PublicService implements IPublicService {
  constructor(private readonly http: IHttpClient) {}

  async searchEvents(lang: string, registrationLink: string): Promise<IAzureSearchResult<IEventData>> {
    return this.http.get<IAzureSearchResult<IEventData>>('/public-search/beneficiary-event', {
      params: {
        language: lang,
        registrationLink,
      },
      containsEncodedURL: true,
    });
  }

  async getTenantByEmisDomain(domain: string): Promise<string> {
    let tenantId = null;
    try {
      tenantId = await this.http.get<string>(`/system-management/tenants/id-from-domain?domain=${domain}`, { globalHandler: false });
    } catch {}
    return tenantId;
  }

  async getTenantByRegistrationDomain(domain: string): Promise<string> {
    let tenantId = null;
    try {
      tenantId = await this.http.get<string>(`/system-management/tenants/id-from-registration-domain?registrationDomain=${domain}`, { globalHandler: false });
    } catch {}
    return tenantId;
  }
}
