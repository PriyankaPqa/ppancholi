import { mockFeatures } from '../../entities/tenantSettings';
import { mockSearchEventsData } from '../../entities/event';
import { IPublicServiceMock } from './public.types';

export const mockPublicService = (): IPublicServiceMock => ({
  searchEvents: jest.fn(() => mockSearchEventsData()),
  getTenantByRegistrationDomain: jest.fn(() => 'tenant-id'),
  getTenantByEmisDomain: jest.fn(() => 'tenant-id'),
  getPublicFeatures: jest.fn(() => mockFeatures()),
});
