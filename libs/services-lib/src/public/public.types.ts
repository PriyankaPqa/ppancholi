import { ISearchParams, ISearchResult } from '@libs/shared-lib/types';
import { IEventSummary } from '@libs/entities-lib/event';
import { IFeatureEntity } from '@libs/entities-lib/src/tenantSettings';

export interface IPublicService {
  fetchRegistrationEvent(lang: string, registrationLink: string): Promise<ISearchResult<IEventSummary>>;
  searchEvents(searchParams: ISearchParams): Promise<ISearchResult<IEventSummary>>;
  searchEventsById(ids: string[]): Promise<ISearchResult<IEventSummary>>;
  getTenantByRegistrationDomain(domain: string): Promise<string>;
  getTenantByEmisDomain(domain: string): Promise<string>;
  getPublicFeatures(): Promise<IFeatureEntity[]>;
  resetPublicToken(): void;
}

export interface IPublicServiceMock {
  fetchRegistrationEvent: jest.Mock<ISearchResult<IEventSummary>>;
  searchEvents: jest.Mock<ISearchResult<IEventSummary>>;
  searchEventsById: jest.Mock<ISearchResult<IEventSummary>>;
  getTenantByRegistrationDomain: jest.Mock<string>;
  getTenantByEmisDomain: jest.Mock<string>;
  getPublicFeatures: jest.Mock<IFeatureEntity[]>; // FeatureKeys.UseIdentityServer
  resetPublicToken: jest.Mock<void>;
}
