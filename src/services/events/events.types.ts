import { IEventData } from '@/entities/event';

export interface IEventsService {
  searchEvents(lang: string, registrationLink: string): Promise<IEventData[]>;
}

export interface IEventsServiceMock {
  searchEvents: jest.Mock<IEventData[]>;
}
