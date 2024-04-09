import { IAzureSearchResult, IAzureSearchParams } from '@libs/shared-lib/types';
/* eslint-disable no-empty */
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';

import helpers from '@libs/shared-lib/helpers/helpers';
import helpersUrl from '@libs/entities-lib/helpers';
import { IFeatureEntity } from '@libs/entities-lib/src/tenantSettings';
import { IEventSummary } from '@libs/entities-lib/event';
import { GlobalHandler, IHttpClient } from '../http-client';
import { IPublicService } from './public.types';

export class PublicService implements IPublicService {
  constructor(private readonly http: IHttpClient) {}

  async fetchRegistrationEvent(lang: string, registrationLink: string): Promise<IAzureSearchResult<IEventSummary>> {
    return this.http.get('/event/search/event-summaries', {
      params: {
        filter: lang === 'fr' ? { 'RegistrationLink/Translation/fr': helpersUrl.encodeUrl(registrationLink) } : { 'RegistrationLink/Translation/en': helpersUrl.encodeUrl(registrationLink) },
      },
      containsEncodedURL: true,
      isODataSql: true,
    });
  }

  async searchEvents(params: IAzureSearchParams): Promise<IAzureSearchResult<IEventSummary>> {
    return this.http.get('/event/search/event-summaries', {
      params,
      containsEncodedURL: true,
      isODataSql: true,
    });
  }

  async searchEventsById(ids: string[]): Promise<IAzureSearchResult<IEventSummary>> {
    return helpers.callSearchInInBatches({
      searchInFilter: 'Id in({ids})',
      service: this,
      ids,
      api: 'searchEvents',
    }) as Promise<IAzureSearchResult<IEventSummary>>;
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
