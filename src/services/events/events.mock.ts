import { mockSearchEventsData } from '../../entities/event';
import { IEventsServiceMock } from './events.types';

export const mockEventsService = (): IEventsServiceMock => ({
  searchEvents: jest.fn(() => mockSearchEventsData()),
});
