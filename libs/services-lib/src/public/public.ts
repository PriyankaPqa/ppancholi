import { IAzureCombinedSearchResult, IAzureSearchParams } from '@libs/shared-lib/types';
/* eslint-disable no-empty */
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { IEventData } from '@libs/entities-lib/registration-event';
import { IEventMetadata } from '@libs/entities-lib/event';
import helpers from '@libs/shared-lib/helpers/helpers';
import { IFeatureEntity } from '@libs/entities-lib/src/tenantSettings';
import { GlobalHandler, IHttpClient } from '../http-client';
import { IPublicService } from './public.types';

export class PublicService implements IPublicService {
  constructor(private readonly http: IHttpClient) {}

  async fetchRegistrationEvent(lang: string, registrationLink: string): Promise<IAzureCombinedSearchResult<IEventData, IEventMetadata>> {
    return this.http.get('/event/public/search/events', {
      params: {
        language: lang,
        registrationLink,
      },
      containsEncodedURL: true,
    });
  }

  async searchEvents(params: IAzureSearchParams): Promise<IAzureCombinedSearchResult<IEventData, IEventMetadata>> {
    return this.http.get('/event/public/search/events', {
      params,
      containsEncodedURL: true,
      isOData: true,
    });
  }

  async searchEventsById(ids: string[]): Promise<IAzureCombinedSearchResult<IEventData, IEventMetadata>> {
    return helpers.callSearchInInBatches({
      searchInFilter: "search.in(Entity/Id, '{ids}')",
      service: this,
      ids,
      api: 'searchEvents',
    }) as Promise<IAzureCombinedSearchResult<IEventData, IEventMetadata>>;
  }

  async getTenantByEmisDomain(domain: string): Promise<string> {
    let tenantId = null;
    try {
      tenantId = await this.http.get<string>(
        `/system-management/tenants/id-from-domain?domain=${domain}`,
        { globalHandler: GlobalHandler.Partial, noErrorLogging: true, ignoreJwt: true },
      );
    } catch (e) {
      // allow to fail silently - probably dev...
      applicationInsights.trackTrace('PublicService.getTenantByEmisDomain', { error: e }, 'public', 'getTenantByEmisDomain');
    }
    return tenantId;
  }

  // added for FeatureKeys.UseIdentityServer, can be removed
  async getPublicFeatures() : Promise<IFeatureEntity[]> {
    let features = null;
    try {
      features = await this.http.get<IFeatureEntity[]>(
        '/system-management/tenant-settings/public-features',
        { globalHandler: GlobalHandler.Partial, noErrorLogging: true, ignoreJwt: true },
      );
    } catch (e) {
      applicationInsights.trackTrace('PublicService.getPublicFeatures', { error: e }, 'public', 'getPublicFeatures');
    }
    return features;
  }

  async getTenantByRegistrationDomain(domain: string): Promise<string> {
    let tenantId = null;
    try {
      tenantId = await this.http.get<string>(
        `/system-management/tenants/id-from-registration-domain?registrationDomain=${domain}`,
        { globalHandler: GlobalHandler.Partial, noErrorLogging: true, ignoreJwt: true },
      );
    } catch (e) {
      // allow to fail silently - probably dev...
      applicationInsights.trackTrace('PublicService.getTenantByRegistrationDomain', { error: e }, 'public', 'getTenantByRegistrationDomain');
    }
    return tenantId;
  }

  resetPublicToken(): void {
    this.http.setPublicToken('');
  }
}
