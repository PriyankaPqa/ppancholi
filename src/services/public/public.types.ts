import { IAzureSearchResult } from '../../types';
import { IEventData } from '../../entities/event';

export interface IPublicService {
  searchEvents(lang: string, registrationLink: string): Promise<IAzureSearchResult<IEventData>>;
}

export interface IPublicServiceMock {
  searchEvents: jest.Mock<IAzureSearchResult<IEventData>>;
}
