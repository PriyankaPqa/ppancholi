import { mockSearchEventsData } from '@libs/entities-lib/registration-event';
import { IPublicServiceMock } from './public.types';

export const mockPublicService = (): IPublicServiceMock => ({
  fetchRegistrationEvent: jest.fn(() => mockSearchEventsData()),
  searchEvents: jest.fn(() => mockSearchEventsData()),
  searchEventsById: jest.fn(() => mockSearchEventsData()),
  getTenantByRegistrationDomain: jest.fn(() => 'tenant-id'),
  getTenantByEmisDomain: jest.fn(() => 'tenant-id'),
});
