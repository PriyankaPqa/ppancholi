import { mockEventTypeData } from '@/entities/eventType';
import { IEventsServiceMock } from './events.types';

export const mockEventsService = (): IEventsServiceMock => ({
  getEventTypes: jest.fn(() => mockEventTypeData()),
});
