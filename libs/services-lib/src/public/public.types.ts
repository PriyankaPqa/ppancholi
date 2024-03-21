import { IAzureSearchParams, IAzureSearchResult } from '@libs/shared-lib/types';
import { IEventSummary } from '@libs/entities-lib/event';
import { IFeatureEntity } from '@libs/entities-lib/src/tenantSettings';

export interface IPublicService {
  fetchRegistrationEvent(lang: string, registrationLink: string): Promise<IAzureSearchResult<IEventSummary>>;
  searchEvents(searchParams: IAzureSearchParams): Promise<IAzureSearchResult<IEventSummary>>;
  searchEventsById(ids: string[]): Promise<IAzureSearchResult<IEventSummary>>;
  getTenantByRegistrationDomain(domain: string): Promise<string>;
  getTenantByEmisDomain(domain: string): Promise<string>;
  getPublicFeatures(): Promise<IFeatureEntity[]>;
  resetPublicToken(): void;
}

export interface IPublicServiceMock {
  fetchRegistrationEvent: jest.Mock<IAzureSearchResult<IEventSummary>>;
  searchEvents: jest.Mock<IAzureSearchResult<IEventSummary>>;
  searchEventsById: jest.Mock<IAzureSearchResult<IEventSummary>>;
  getTenantByRegistrationDomain: jest.Mock<string>;
  getTenantByEmisDomain: jest.Mock<string>;
  getPublicFeatures: jest.Mock<IFeatureEntity[]>; // FeatureKeys.UseIdentityServer
  resetPublicToken: jest.Mock<void>;
}
