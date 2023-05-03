import { mockSearchEventsData } from '@libs/entities-lib/registration-event';
import { mockFeatures } from '@libs/entities-lib/tenantSettings';
import { IPublicServiceMock } from './public.types';

export const mockPublicService = (): IPublicServiceMock => ({
  fetchRegistrationEvent: jest.fn(() => mockSearchEventsData()),
  searchEvents: jest.fn(() => mockSearchEventsData()),
  searchEventsById: jest.fn(() => mockSearchEventsData()),
  getTenantByRegistrationDomain: jest.fn(() => 'tenant-id'),
  getTenantByEmisDomain: jest.fn(() => 'tenant-id'),
  getPublicFeatures: jest.fn(() => mockFeatures()), // FeatureKeys.UseIdentityServer
  resetPublicToken: jest.fn(),
});
