import { IAzureSearchResult } from '@/types';
import { IEventData } from '../../entities/event';

export interface IEventsService {
  searchEvents(lang: string, registrationLink: string): Promise<IAzureSearchResult<IEventData>>;
}

export interface IEventsServiceMock {
  searchEvents: jest.Mock<IAzureSearchResult<IEventData>>;
}
