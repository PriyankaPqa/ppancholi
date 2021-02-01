import { mockEventsData, mockOtherProvinceData, mockRegionData } from '@/entities/event';
import { mockEventTypeData } from '@/entities/eventType';
import { IEventsServiceMock } from './events.types';

export const mockEventsService = (): IEventsServiceMock => ({
  createEvent: jest.fn(() => mockEventsData()[0]),
  getEvents: jest.fn(() => mockEventsData()),
  getEventTypes: jest.fn(() => mockEventTypeData()),
  getOtherProvinces: jest.fn(() => mockOtherProvinceData()),
  getRegions: jest.fn(() => mockRegionData()),
});
