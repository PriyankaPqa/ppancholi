import { IAzureSearchParams, IAzureSearchResult, ICombinedIndex } from '@libs/shared-lib/types';
import { IEventData } from '@libs/entities-lib/registration-event';
import { IEventMetadata } from '@libs/entities-lib/event';
import { IFeatureEntity } from '@libs/entities-lib/src/tenantSettings';

export interface IPublicService {
  fetchRegistrationEvent(lang: string, registrationLink: string): Promise<IAzureSearchResult<ICombinedIndex<IEventData, IEventMetadata>>>;
  searchEvents(searchParams: IAzureSearchParams): Promise<IAzureSearchResult<ICombinedIndex<IEventData, IEventMetadata>>>;
  searchEventsById(ids: string[]): Promise<IAzureSearchResult<ICombinedIndex<IEventData, IEventMetadata>>>;
  getTenantByRegistrationDomain(domain: string): Promise<string>;
  getTenantByEmisDomain(domain: string): Promise<string>;
  getPublicFeatures(): Promise<IFeatureEntity[]>;
  resetPublicToken(): void;
}

export interface IPublicServiceMock {
  fetchRegistrationEvent: jest.Mock<IAzureSearchResult<ICombinedIndex<IEventData, IEventMetadata>>>;
  searchEvents: jest.Mock<IAzureSearchResult<ICombinedIndex<IEventData, IEventMetadata>>>;
  searchEventsById: jest.Mock<IAzureSearchResult<ICombinedIndex<IEventData, IEventMetadata>>>;
  getTenantByRegistrationDomain: jest.Mock<string>;
  getTenantByEmisDomain: jest.Mock<string>;
  getPublicFeatures: jest.Mock<IFeatureEntity[]>; // FeatureKeys.UseIdentityServer
  resetPublicToken: jest.Mock<void>;
}
