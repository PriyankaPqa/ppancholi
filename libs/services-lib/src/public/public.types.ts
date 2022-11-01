import { IAzureSearchParams, IAzureSearchResult } from '@libs/shared-lib/types';

export interface IPublicService {
  searchEvents(lang?: string, registrationLink?: string, searchParams?: IAzureSearchParams): Promise<IAzureSearchResult<unknown>>;
  searchEventsById(ids: string[]): Promise<IAzureSearchResult<unknown>>;
  getTenantByRegistrationDomain(domain: string): Promise<string>;
  getTenantByEmisDomain(domain: string): Promise<string>;
}

export interface IPublicServiceMock {
  searchEvents: jest.Mock<IAzureSearchResult<unknown>>;
  searchEventsById: jest.Mock<IAzureSearchResult<unknown>>;
  getTenantByRegistrationDomain: jest.Mock<string>;
  getTenantByEmisDomain: jest.Mock<string>;
}
