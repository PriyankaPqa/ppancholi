import { IAzureSearchResult } from '../../types';

export interface IPublicService {
  searchEvents(lang: string, registrationLink: string): Promise<IAzureSearchResult<unknown>>;
}

export interface IPublicServiceMock {
  searchEvents: jest.Mock<IAzureSearchResult<unknown>>;
}
