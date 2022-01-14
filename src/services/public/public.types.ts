import { IFeatureEntity } from '../../entities/tenantSettings';
import { IAzureSearchResult } from '../../types';

export interface IPublicService {
  searchEvents(lang: string, registrationLink: string): Promise<IAzureSearchResult<unknown>>;
  getTenantByRegistrationDomain(domain: string): Promise<string>;
  getTenantByEmisDomain(domain: string): Promise<string>;
  getPublicFeatures(): Promise<IFeatureEntity[]>;
}

export interface IPublicServiceMock {
  searchEvents: jest.Mock<IAzureSearchResult<unknown>>;
  getTenantByRegistrationDomain: jest.Mock<string>;
  getTenantByEmisDomain: jest.Mock<string>;
  getPublicFeatures: jest.Mock<IFeatureEntity[]>;
}
