import {
  mockEventsData, mockOtherProvinceData, mockRegionData, mockSearchEvents,
} from '@/entities/event';
import { IEventsServiceMock } from './events.types';

export const mockEventsService = (): IEventsServiceMock => ({
  createEvent: jest.fn(() => mockEventsData()[0]),
  updateEvent: jest.fn(() => mockEventsData()[0]),
  toggleSelfRegistration: jest.fn(() => mockEventsData()[0]),
  getOtherProvinces: jest.fn(() => mockOtherProvinceData()),
  getRegions: jest.fn(() => mockRegionData()),
  searchEvents: jest.fn(() => mockSearchEvents()),
  addCallCentre: jest.fn(() => mockEventsData()[0]),
  editCallCentre: jest.fn(() => mockEventsData()[0]),
});
