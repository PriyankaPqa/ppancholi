import { mockEventsData } from '@/entities/event';
import { mockEventTypeData } from '@/entities/eventType';
import { IEventsServiceMock } from './events.types';

export const mockEventsService = (): IEventsServiceMock => ({
  createEvent: jest.fn(() => mockEventsData()[0]),
  getEvents: jest.fn(() => []),
  getEventTypes: jest.fn(() => mockEventTypeData()),
});
