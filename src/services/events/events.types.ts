import { IEventData } from '@/entities/event';
import { ISearchData } from '@/types';

export interface IEventsService {
  searchEvents(params: ISearchData): Promise<IEventData[]>;
}

export interface IEventsServiceMock {
  searchEvents: jest.Mock<IEventData[]>;
}
