import {
  mockEventsData, mockOtherProvinceData, mockRegionData, mockSearchEvents,
} from '@/entities/event';
import { IEventsServiceMock } from './events.types';

export const mockEventsService = (): IEventsServiceMock => ({
  createEvent: jest.fn(() => mockEventsData()[0]),
  updateEvent: jest.fn(() => mockEventsData()[0]),
  getEventById: jest.fn(() => mockEventsData()[0]),
  getEvents: jest.fn(() => mockEventsData()),
  getOtherProvinces: jest.fn(() => mockOtherProvinceData()),
  getRegions: jest.fn(() => mockRegionData()),
  searchEvents: jest.fn(() => mockSearchEvents()),
});
