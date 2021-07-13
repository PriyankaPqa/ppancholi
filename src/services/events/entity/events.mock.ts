import {
  mockEventEntities,
  mockEventEntity,
  mockOtherProvinceData,
  mockRegionData,
} from '@/entities/event';
import { mockDomainBaseService } from '@/services/base/base.mock';
import { IEventsServiceMock } from './events.types';

export const mockEventsService = (): IEventsServiceMock => ({
  ...mockDomainBaseService(mockEventEntities()),

  createEvent: jest.fn(() => mockEventEntity()),
  updateEvent: jest.fn(() => mockEventEntity()),
  toggleSelfRegistration: jest.fn(() => mockEventEntity()),
  getOtherProvinces: jest.fn(() => mockOtherProvinceData()),
  getRegions: jest.fn(() => mockRegionData()),
  setEventStatus: jest.fn(() => mockEventEntity()),
  addCallCentre: jest.fn(() => mockEventEntity()),
  editCallCentre: jest.fn(() => mockEventEntity()),
  addAgreement: jest.fn(() => mockEventEntity()),
  editAgreement: jest.fn(() => mockEventEntity()),
  removeAgreement: jest.fn(() => mockEventEntity()),
  addRegistrationLocation: jest.fn(() => mockEventEntity()),
  editRegistrationLocation: jest.fn(() => mockEventEntity()),
  addShelterLocation: jest.fn(() => mockEventEntity()),
  editShelterLocation: jest.fn(() => mockEventEntity()),
  searchMyEvents: jest.fn(),
});
