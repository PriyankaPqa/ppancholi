import { mockFeatures } from '@libs/entities-lib/tenantSettings';
import { mockSearchEventSummary } from '@libs/entities-lib/event';
import { IPublicServiceMock } from './public.types';

export const mockPublicService = (): IPublicServiceMock => ({
  fetchRegistrationEvent: jest.fn(() => mockSearchEventSummary()),
  searchEvents: jest.fn(() => mockSearchEventSummary()),
  searchEventsById: jest.fn(() => mockSearchEventSummary()),
  getTenantByRegistrationDomain: jest.fn(() => 'tenant-id'),
  getTenantByEmisDomain: jest.fn(() => 'tenant-id'),
  getPublicFeatures: jest.fn(() => mockFeatures()), // FeatureKeys.UseIdentityServer
  resetPublicToken: jest.fn(),
});
