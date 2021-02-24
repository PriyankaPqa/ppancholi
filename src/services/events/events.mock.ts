import { mockEventsData, mockOtherProvinceData, mockRegionData } from '@/entities/event';
import { IEventsServiceMock } from './events.types';

export const mockEventsService = (): IEventsServiceMock => ({
  createEvent: jest.fn(() => mockEventsData()[0]),
  getEvents: jest.fn(() => mockEventsData()),
  getOtherProvinces: jest.fn(() => mockOtherProvinceData()),
  getRegions: jest.fn(() => mockRegionData()),
  searchEvents: jest.fn(() => []),
});
