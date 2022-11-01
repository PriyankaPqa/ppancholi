/* eslint-disable no-empty */
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { IAzureSearchParams, IAzureSearchResult } from '@libs/shared-lib/types';
import { IEventData } from '@libs/entities-lib/registration-event';
import { IHttpClient } from '../http-client';
import { IPublicService } from './public.types';

export class PublicService implements IPublicService {
  constructor(private readonly http: IHttpClient) {}

  async searchEvents(lang?: string, registrationLink?: string, searchParams?: IAzureSearchParams): Promise<IAzureSearchResult<IEventData>> {
    return this.http.get<IAzureSearchResult<IEventData>>('/event/public/search/events', {
      params: {
        language: lang,
        registrationLink,
        ...(searchParams),
      },
      containsEncodedURL: true,
      isOData: true,
    });
  }

  async searchEventsById(ids: string[]): Promise<IAzureSearchResult<IEventData>> {
    const filter = `search.in(Entity/Id, '${ids.join('|')}', '|')`;
    const eventsData = await this.searchEvents(undefined, undefined, {
      filter,
      top: 999,
    });
    return eventsData;
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
