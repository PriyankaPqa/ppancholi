import { mockEventsData } from '../../entities/event';
import { IEventsServiceMock } from './events.types';

export const mockEventsService = (): IEventsServiceMock => ({
  searchEvents: jest.fn(() => mockEventsData()),
});
