import { IAzureSearchResult } from '../../types';

export interface IPublicService {
  searchEvents(lang: string, registrationLink: string): Promise<IAzureSearchResult<unknown>>;
  getTenantByRegistrationDomain(domain: string): Promise<string>;
  getTenantByEmisDomain(domain: string): Promise<string>;
}

export interface IPublicServiceMock {
  searchEvents: jest.Mock<IAzureSearchResult<unknown>>;
  getTenantByRegistrationDomain: jest.Mock<string>;
  getTenantByEmisDomain: jest.Mock<string>;
}
