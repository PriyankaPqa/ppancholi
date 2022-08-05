import { mockSearchEventsData } from '../../../../entities-lib/src/registration-event';
import { IPublicServiceMock } from './public.types';

export const mockPublicService = (): IPublicServiceMock => ({
  searchEvents: jest.fn(() => mockSearchEventsData()),
  getTenantByRegistrationDomain: jest.fn(() => 'tenant-id'),
  getTenantByEmisDomain: jest.fn(() => 'tenant-id'),
});
