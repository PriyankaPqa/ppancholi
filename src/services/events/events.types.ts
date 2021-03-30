import { IEventData } from '@/entities/event';
import { IAzureSearchResult } from '@/types';

export interface IEventsService {
  searchEvents(lang: string, registrationLink: string): Promise<IAzureSearchResult<IEventData>>;
}

export interface IEventsServiceMock {
  searchEvents: jest.Mock<IAzureSearchResult<IEventData>>;
}
