/* eslint-disable no-empty */
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { IAzureSearchParams, IAzureSearchResult, ICombinedIndex } from '@libs/shared-lib/types';
import { IEventData } from '@libs/entities-lib/registration-event';
import { IEventMetadata } from '@libs/entities-lib/event';
import { IHttpClient } from '../http-client';
import { IPublicService } from './public.types';

export class PublicService implements IPublicService {
  constructor(private readonly http: IHttpClient) {}

  async fetchRegistrationEvent(lang: string, registrationLink: string): Promise<IAzureSearchResult<ICombinedIndex<IEventData, IEventMetadata>>> {
    return this.http.get('/event/public/search/events', {
      params: {
        language: lang,
        registrationLink,
      },
      containsEncodedURL: true,
    });
  }

  async searchEvents(params: IAzureSearchParams): Promise<IAzureSearchResult<ICombinedIndex<IEventData, IEventMetadata>>> {
    return this.http.get('/event/public/search/events', {
      params,
      containsEncodedURL: true,
      isOData: true,
    });
  }

  async searchEventsById(ids: string[]): Promise<IAzureSearchResult<ICombinedIndex<IEventData, IEventMetadata>>> {
    const filter = `search.in(Entity/Id, '${ids.join('|')}', '|')`;
    const eventsData = await this.searchEvents({
      filter,
      top: 999,
    });
    return eventsData;
  }

  async getTenantByEmisDomain(domain: string): Promise<string> {
    let tenantId = null;
    try {
      tenantId = await this.http.get<string>(
`/system-management/tenants/id-from-domain?domain=${domain}`,
        { globalHandler: false, noErrorLogging: true, ignoreJwt: true },
);
    } catch (e) {
      // allow to fail silently - probably dev...
      applicationInsights.trackTrace('PublicService.getTenantByEmisDomain', { error: e }, 'public', 'getTenantByEmisDomain');
    }
    return tenantId;
  }

  async getTenantByRegistrationDomain(domain: string): Promise<string> {
    let tenantId = null;
    try {
      tenantId = await this.http.get<string>(
`/system-management/tenants/id-from-registration-domain?registrationDomain=${domain}`,
        { globalHandler: false, noErrorLogging: true, ignoreJwt: true },
);
    } catch (e) {
      // allow to fail silently - probably dev...
      applicationInsights.trackTrace('PublicService.getTenantByRegistrationDomain', { error: e }, 'public', 'getTenantByRegistrationDomain');
    }
    return tenantId;
  }
}
